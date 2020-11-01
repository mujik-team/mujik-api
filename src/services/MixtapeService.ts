import { db } from "../utils/db";
import { Mixtape } from "../model/MixtapeModel";

export async function GetMixtape(id: string): Promise<Mixtape> {
  const users = db.collection("user");
  return { id: "1234", title: "The First One", author: "mckillagorilla" };
}
