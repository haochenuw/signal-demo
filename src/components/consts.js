export const textDescriptions = {
    "chainKey": ["Each chain consists of a one-way growing list of chain keys", 
                "Every new chain key is created from the previous one using a Key Derivation Function", 
                "Together with a new chain key, a message key is also created"], 
    "messageKey": ["The clients use message keys to encrypt and decrypt messages", "One message key will be used to encrypt/decrypt one message", "Client derive message keys from chain keys"]
}