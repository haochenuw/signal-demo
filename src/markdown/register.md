# Registration 

- To register to the Signal protocol, a client needs to generate one (public, private) keypair for signing (jargon for this is the "identity key"), and various keypairs for diffie-hellman key exchange (the "prekeys"). 

- Then, the client stores these keypairs in its local storage and send the public keys (the "prekey bundle") to a server. The server stores prekey bundles for the registered clients. 

