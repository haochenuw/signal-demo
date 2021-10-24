## Protocol Invariants 

- If the last message is sent from A to B, then there will be a sending chain held by A and a receiving chain held by B 
with exactly same state. 


- Sending additional messages (a follow-up message) will update both chains, keeping them in sync. 

- Sending a reply message (for example B->A followed by A->B) will 


## Chain update 


## Chain creation 

There are three events that can trigger chain creation. 

### 1. Sending the first message 


### 2. Receiving the first message

### 3. Replying to a message

### 4. 