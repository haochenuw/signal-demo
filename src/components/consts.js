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

const spacing = 300; 

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
        nodes: [
            { id: 'node-1', content: 'their public identity key', coordinates: [0, 0], },
            { id: 'node-2', content: 'their public signed prekey ', coordinates: [spacing, 0], },
            { id: 'node-3', content: 'their public onetime prekey', coordinates: [spacing*2, 0], },
            { id: 'node-4', content: 'our ephemeral private key', coordinates: [100, 200], },
            { id: 'node-5', content: 'New Chain Key', coordinates: [100+spacing, 200], },
          ],
          links: [
            { input: 'node-1',  output: 'node-4' },
            { input: 'node-2',  output: 'node-3' },
            { input: 'node-2',  output: 'node-4' },
          ]
    }, 
    "session": {
        nodes: [
        { id: 'ratchet-1', content: 'Ratchet_1', coordinates: [250, 0], },
        { id: 'ratchet-2', content: 'Ratchet_2', coordinates: [250, 100], },
        { id: 'ratchet-3', content: 'Ratchet_3', coordinates: [250, 200], },
        { id: 'ratchet-4', content: 'Ratchet_4', coordinates: [250, 300], },
        { id: 'chain-1', content: 'Chain_1', coordinates: [400, 20], },
        { id: 'chain-2', content: 'Chain_2', coordinates: [400, 120], },
        { id: 'chain-3', content: 'Chain_3', coordinates: [400, 220], },
      ],
      links: [
        { input: 'ratchet-1',  output: 'ratchet-2' },
        { input: 'ratchet-2',  output: 'ratchet-3' },
        { input: 'ratchet-3',  output: 'ratchet-4' },
        { input: 'ratchet-1',  output: 'chain-1' },
        { input: 'ratchet-2',  output: 'chain-2' },
        { input: 'ratchet-3',  output: 'chain-3' },
      ]
    }, 
    "chainKey": {
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
    "chain": {
        nodes: [
            { id: 'chainKey-1', content: 'chainKey_1', coordinates: [0, 0], },
            { id: 'chainKey-2', content: 'chainKey_2', coordinates: [spacing, 0], },
            { id: 'chainKey-3', content: 'chainKey_3', coordinates: [spacing*2, 0], },
            { id: 'chainKey-4', content: 'chainKey_4', coordinates: [spacing*3, 0], },
            { id: 'messageKey-1', content: 'messageKey_1', coordinates: [spacing/2, 200], },
            { id: 'messageKey-2', content: 'messageKey_2', coordinates: [spacing/2 + spacing, 200], },
            { id: 'messageKey-3', content: 'messageKey_3', coordinates: [spacing/2 + spacing*2, 200], },
          ],
          links: [
            { input: 'chainKey-1',  output: 'chainKey-2' },
            { input: 'chainKey-2',  output: 'chainKey-3' },
            { input: 'chainKey-3',  output: 'chainKey-4' },
            { input: 'chainKey-1',  output: 'messageKey-1' },
            { input: 'chainKey-2',  output: 'messageKey-2' },
            { input: 'chainKey-3',  output: 'messageKey-3' },
          ]
    }
}