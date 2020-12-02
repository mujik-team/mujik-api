import { AuthService } from "../services/AuthService";
import { Route } from "./_types";
import multer from "multer";
import { ResultOK } from "../utils/ResultGenerator";
import { _MixtapeService } from "../app";

const userProfileUpload = multer({
  storage: multer.diskStorage({
    destination: `${process.env.UPLOAD_DIR || "/var/mujik/uploads"}/avatars`,
    filename: (req, file, cb) => {
      const { username } = req.user as any;

      cb(null, username);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (file.mimetype.includes("image")) return callback(null, true);
    else return callback(new Error("Only images are allowed."));
  },
}).single("avatar");

const mixtapeImageUpload = multer({
  storage: multer.diskStorage({
    destination: `${process.env.UPLOAD_DIR || "/var/mujik/uploads"}/mixtapes`,
    filename: async (req, file, cb) => {
      const { id } = req.params as any;
      cb(null, id);
    },
  }),
  fileFilter: async (req, file, callback) => {
    const { id } = req.params as any;

    if (!(await _MixtapeService.GetMixtape(id))) {
      return callback(new Error("Mixtape with that id doesn't exist."));
    }

    if (file.mimetype.includes("image")) return callback(null, true);
    else return callback(new Error("Only images are allowed."));
  },
}).single("mixtape");

export const UploadRoutes: Route[] = [
  {
    path: "/upload/avatar",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      userProfileUpload,
      async (req, res) => {
        res.json(ResultOK("Successfully updated avatar."));
      },
    ],
  },
  {
    path: "/upload/mixtape/:id",
    method: "post",
    handler: [
      AuthService.isAuthenticated,
      mixtapeImageUpload,
      async (req, res) => {
        res.json(ResultOK("Successfully updated mixtape image."));
      },
    ],
  },
];
