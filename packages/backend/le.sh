#/bin/bash
sudo certbot certonly --standalone -d **YOURDOMAINNAME** --config-dir ~/.certbot/config --logs-dir ~/.certbot/logs --work-dir ~/.certbot/work

sudo cp -f ~/.certbot/config/live/**YOURDOMAINNAME**/privkey.pem server.key;sudo chmod 0777 server.key
sudo cp -f ~/.certbot/config/live/**YOURDOMAINNAME**/fullchain.pem server.cert;sudo chmod 0777 server.cert
