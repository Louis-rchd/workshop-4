import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // Health check for status
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  // Handle message posting
  _user.post("/message", (req, res) => {
    try {
        const { message, destinationUserId }: SendMessageBody = req.body;
        if (!message || destinationUserId === undefined) {
            throw new Error("Invalid request body");
        }
        lastReceivedMessage = message;
        lastSentMessage = message; // Mettre à jour correctement
        return res.json({ result: "success" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(400).json({ error: errorMessage });
  }  
}); 

  // Get last received message
  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: lastReceivedMessage });
  });

  // Get last sent message
  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: lastSentMessage });
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}

