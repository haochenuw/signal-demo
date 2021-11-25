export const textDescriptions = {
    "registration": ["To register, a client generates many public/private keypairs", "These keypairs are given names: one identity key, some signed prekeys, and many onetime prekeys", 
    "The client sends the public keys to the Signal server, who stores them alongside the client's id (e.g. phone no.)"], 
    "chainKey": ["Each chain consists of a one-way growing list of chain keys", 
                "Every new chain key is created from the previous one using a Key Derivation Function", 
                "Together with a new chain key, a message key is also created"], 
    "messageKey": ["The clients use message keys to encrypt and decrypt messages", "One message key will be used to encrypt/decrypt one message", "Client derive message keys from chain keys"],
    "session": ["Sessions are stateful data structures that clients use to keep the secret info when talking to each other", 
                "A session consists of an ordered list of Ratchets; each ratchet derives at most one Chain"], 
    "ratchet": ["A ratchet consists of a rootkey and a ephemeral keypair", "The client generates each ephemeral keypair from random", "The initial rootkey for sender comes from X3DH"],
    "x3dh": ["X3DH is a fancy name for doing Diffie-Hellman key exchange 3 times", 
            "A client performs X3DH to initialize a session", 
            "It takes a prekey bundle downloaded from Signal server, and some local randomness", 
            "Client uses the output of X3DH to derive a rootkey, which is part of the first ratchet"], 
    "prekeyBundle": [

    ], 
    "chain": ["A chain is a list of chain keys; each chain key derives a message key except the last one", 
              "Each chain is derived from a unique ratchet", "There are two types of chains: sending chain and receiving chain", 
              "The chain type alternates: if a chain is sending, then the next chain is receiving",
              "The chain type also flips on the other client: a sending chain for Alice is a receiving chain for Bob", 
              "When encrypting a message, a client will derive a message from the newest sending chain", 
              "When decrypting a message, a client uses some metadata from the message to identify which receiving chain to use"], 
    "rootKey": ["Important invariant: the rootkeys are always the same in the two client's sessions", 
                "The first rootkeys are the same thanks to X3DH", "The client derives each new rootkey using the entropy of the current rootkey, plus an additional Diffie-Hellman", 
                "The additioanl Diffie-Hellman uses a separate ephemeral private key that the client generates locally, and a ephemeral public key from the other end"] 
}

export const graphDefs = {
    "registration": {
            nodes: [
              { id: 'node-1', content: 'Old Chain Key', coordinates: [250, 60], },
              { id: 'node-2', content: 'KDF', coordinates: [250, 200], },
              { id: 'node-3', content: 'Message Key', coordinates: [350, 200], },
              { id: 'node-4', content: 'New Chain Key', coordinates: [250, 320], },
            ],
            links: [
              { input: 'node-1',  output: 'node-2' },
              { input: 'node-2',  output: 'node-3' },
              { input: 'node-2',  output: 'node-4' },
            ]
    }, 
    "x3dh": {
        
    }
}