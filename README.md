# Demo React Application using the libsignal-protocol-typescript


## Deployment

To deploy this website to AWS EC2, 

1. launch a EC2 instance. Allow http and https in the security group config. 

2. SSH into the instance, install necessary packages and clone this repository 
```
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Activate nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install Node.js version 16.20.0
nvm install 16.20.0

# Install Git and apache2
sudo apt-get update
sudo apt-get install git apache2 -y

# clone the signal demo app if needed
directory_path="./signal-demo"

if [ -d "$directory_path" ]; then
    echo "Directory $directory_path exists"
else
    echo "Directory $directory_path does not exist"
    git clone https://github.com/haochenuw/signal-demo.git
fi
```
3. Build and setup the dependencies. 
Note: if EC2 build fails. Can build locally.  
```
cd signal-demo 
bash setup.sh 
npm run build 
```  

4. Copy the build files into apache2 location 
```
mv -r build /var/www/SignalBuild
```
If not built on EC2, 
```
scp -r build user@ec2-ip:/var/www/SignalBuild 
```

5. Configure apache2 
```
cd etc/apache2/sites-available
sudo mv 000-default.conf 001-signal.conf
```
Then, put the following into the file 001-signal.conf
```
<VirtualHost *:443>
        ServerName https://ec2-54-201-48-228.us-west-2.compute.amazonaws.com/

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/SignalBuild


        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        SSLEngine on
        SSLCertificateFile /etc/apache2/certs/apache.crt
        SSLCertificateKeyFile /etc/apache2/certs/apache.key
</VirtualHost>
```

6. Setup SSL config (note: this is required for crypto functionalities to work)
```
sudo apt-get install openssl
  48  sudo a2enmod ssl
   49  sudo a2enmod rewrite
   51  sudo mkdir /etc/apache2/certs
```
Then, go into /etc/apache2/apache2.conf and change the section to be this: 

```
<Directory /var/www/>
        Options Indexes FollowSymLinks
        AllowOverride ALL
        Require all granted
</Directory>
``` 
Then, generate a self-signed cert
```
   52  cd /etc/apache2/certs
   53  sudo openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out apache.crt -keyout apache.key
```

7. start service 
```
sudo systemctl restart apache2
```
To verify it works, go to the public IP of your EC2 instance. 

