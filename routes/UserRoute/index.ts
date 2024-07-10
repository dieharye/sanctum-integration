import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';
import { authMiddleware, AuthRequest } from '../../middleware';
import User, {UserRole} from '../../model/UserModel';
import { generateRandomNonce, uuid } from '../../utils/generator';
import { validateEd25519Address, verifySignature } from '../../utils/solana';
import { getQuote, swapToLst } from '../../utils/sanctum'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


// Create a new instance of the Express Router
const UserRouter = Router();

// @route    GET api/users/getNonce
// @desc     Get nonce of user
// @access   Public
UserRouter.get('/getNonce', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.query;
    const isValid = validateEd25519Address(walletAddress as string);
    if (!isValid) {
      console.error('[NONCE]: Wallet address is invalid');
      return res.status(400).json({ error: 'wallet address is invalid' });
    }

    const user = await User.findOne({
      walletAddress,
    });
    if (user) {
      return res.json({ nonce: user.nonce });
    } else {
      return res.status(404).json({ error: 'Not found wallet address' });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).send({ error });
  }
});

// @route    POST api/users/signup
// @desc     Register user
// @access   Public
UserRouter.post(
  '/signup',
  check('walletAddress', 'Wallet address is required').notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const { walletAddress } = req.body;

      const isValid = validateEd25519Address(walletAddress);
      if (!isValid) {
        console.error('[SIGNUP]: Wallet address is invalid');
        return res.status(400).json({ error: 'wallet address is invalid' });
      }

      const nonce = generateRandomNonce();

      let user = await User.findOne({
        walletAddress,
      });
      if (user) {
        await User.findOneAndUpdate({ walletAddress }, { nonce });
      } else {
        const name = uuid();
        const newUser = new User({
          walletAddress,
          name,
          nonce,
        });

        await newUser.save();
      }
      return res.json({ nonce });
    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error });
    }
  }
);

// @route    POST api/users/signin
// @desc     Authenticate user & get token
// @access   Public
UserRouter.post(
  '/signin',
  check('walletAddress', 'Wallet address is required').notEmpty(),
  check('signature', 'Signature is required').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { walletAddress, signature } = req.body;

    const isValid = validateEd25519Address(walletAddress);
    if (!isValid) {
      console.error('[SIGNIN]: Wallet address is invalid');
      return res.status(400).json({ error: 'wallet address is invalid' });
    }

    try {
      const user = await User.findOne({ walletAddress });

      if (!user) {
        return res.status(404).json({ error: 'Wallet address not found' });
      }

      const valid_signature = verifySignature(
        user.walletAddress,
        user.nonce,
        signature
      );

      if (!valid_signature) {
        return res.status(400).json({ error: 'Provided signature is invalid' });
      }

      await User.findByIdAndUpdate(
        user.id,
        {
          lastLogin: new Date(),
        },
        { new: true }
      );

      const payload = {
        user: {
          id: user.id,
          walletaddress: user.walletAddress,
          name: user.name,
          role: user.role,
        },
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
        if (err) throw err;
        return res.json({
          token,
        });
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error: error });
    }
  }
);

// @route    GET api/users
// @desc     Get user by token
// @access   Private
UserRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({
      ...user?.toObject(),
    });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send({ error: err });
  }
});


// @route    POST api/users/trade
// @desc     Buy USDC
// @access   Public
UserRouter.post('/trade', authMiddleware, async (req: AuthRequest, res: Response) => {
  console.log(req.user)
  try {
    // Find user by ID
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found." });
    }

    // Check user role
    const role = user.role;
    console.log(user);

    if (role === UserRole.User) {
      res.status(401).json({ success: false, msg: "You are neither an administrator nor a manager." });
    }
  } catch (error) {
    res.status(500).json({msg: "Internal Server Error"})
  }

  const { amount, inputMint, outputMint } = req.body
  const lamports = amount * LAMPORTS_PER_SOL
  try {
    console.log("sent quote")
    const response = await getQuote(inputMint, outputMint, lamports)
    console.log("result :", response);
    console.log("SWAP REQUEST SENT")
    const result: boolean = await swapToLst(lamports, inputMint, outputMint, response)
    if (result) res.status(200).json({ msg: "Trading successful" })
    else res.status(500).json({ msg: "Internal sever error." })
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: "Internal sever error." })
  }
})
export default UserRouter;
