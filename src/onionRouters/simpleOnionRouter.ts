import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json()); // Only express.json() is needed.

  // Status route to check if the router is live
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  // Declare state variables for messages
  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

  // Get the last received encrypted message
  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  // Get the last received decrypted message
  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  // Get the last message destination
  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });

  // Mock route to get the private key for the node
  onionRouter.get("/getPrivateKey", (req, res) => {
    // In a real-world scenario, you would return an actual private key here.
    res.json({ privateKey: `privateKey-${nodeId}` });
  });

  // Start the server and listen on a port based on the nodeId
  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}

