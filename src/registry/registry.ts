import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import { importPubKey } from "../crypto";

// Types pour Node et Body de requête
export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // Tableau pour stocker les nœuds enregistrés
  let registeredNodes: Node[] = [];

  // Vérification de la santé du serveur
  _registry.get("/status", (req, res) => {
    console.log("Registry is live!");
    res.send("live");
  });

  // Fonction pour valider le format de la clé publique
  const isValidPubKey = async (pubKey: string) => {
    try {
        await importPubKey(pubKey); // Tente d'importer la clé RSA
        return true;
    } catch (error) {
        return false;
    }
};

  // Route pour enregistrer un nœud
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    console.log(`Received registration request for nodeId: ${nodeId}, pubKey: ${pubKey}`);

    // Vérifier si le nodeId existe déjà
    if (registeredNodes.some((node) => node.nodeId === nodeId)) {
      console.error(`Node with nodeId: ${nodeId} already registered.`);
      return res.status(400).json({ success: false, error: "Node already registered" });
    }

    // Vérifier si la clé publique est au bon format
    if (!isValidPubKey(pubKey)) {
      console.error(`Invalid public key format for pubKey: ${pubKey}`);
      return res.status(400).json({ success: false, error: "Invalid public key format" });
    }

    // Vérifier si la clé publique est déjà utilisée
    if (registeredNodes.some((node) => node.pubKey === pubKey)) {
      console.error(`Public key ${pubKey} already registered.`);
      return res.status(400).json({ success: false, error: "Public key already registered" });
    }

    // Ajouter le nœud au registre
    registeredNodes.push({ nodeId, pubKey });

    // Log de l'ajout du nœud
    console.log(`Node with nodeId: ${nodeId} and pubKey: ${pubKey} successfully registered.`);

    // Répondre avec succès
    return res.json({ success: true });
  });

  // Route pour obtenir le registre des nœuds
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    console.log("Getting node registry.");
    res.json({ nodes: registeredNodes });
  });

  // Démarrer le serveur
  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  // Retourner le serveur pour éviter les erreurs de chemin de code
  return server;
}
