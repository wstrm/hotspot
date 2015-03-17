Hotspot (Work in Progress) [![Build Status](https://travis-ci.org/willeponken/hotspot.svg)](https://travis-ci.org/willeponken/hotspot)
=======

Captive portal for CJDNS

## TODO
- [x] Don't use a upload form for the cjdroute.conf (security problems)
- [x] Get IP Tunnels to work (automate everything)
- [x] Work out how this should be done?
- [ ] Replace node-cjdnsadmin with cjdns-admin module (on npm)

## Vision
The idea is to have a CJDNS-only network, but before that, people want to be able to access the Internet.
This ~~is a~~ will be a general purpose captive portal, but as I'm in quite a hurry for my school project (inter alia this) there is some hardcoded stuff.

## Contribute
I appreciate contributions, but also scolding for mistakes, etc.

## Deploy & setup
### Setup
#### Easy way
* `npm install`.
* Edit `config/cjdns.json` and add the correct path to `cjdroute.conf` or `.cjdnsadmin`.
* Edit `config/hotspot.json` and change port and address to the appropriate, and change the information under `hotspot`. Also update `download` and poin to where the file is, or remove if you don't want to serve any files.

####Custom way
* Do all the steps under `Easy way`.
* Now you can edit the view and stylesheets for a custom appearance.
	* Views `views/`
	* Stylesheets `public/src/stylesheets/`
* You'll then need to rebuild the stylesheets with `npm install` or `bin/make`.

###Deploy
To start the hotspot, run `npm start` or `bin/hotspot`

## Test
Run tests with
`npm test`

## Brainstorm
Here I'll brainstorm how this should be done.

### Links
* https://github.com/berlinmeshnet/splashpage

### Basic CJDNS -> Hypeboria connection
| CLIENT                                                      | SERVER                                |
|-------------------------------------------------------------|---------------------------------------|
| Connect via WiFi through AP whose gateway is the server.    |                                       |
| Tries to connect to a webpage.                              |                                       |
|                                                             | Redirecting to captive portal.        |
| Registering at the captive portal.*                         |                                       |
| Downloads CJDNS from captive portal, and then runs it.      |                                       |

`* Could be removed and only show the user a download link for CJDNS and instructions.`

### IP Tunnel connection to Internet
| CLIENT                                                      | SERVER                                                                     |
|-------------------------------------------------------------|----------------------------------------------------------------------------|
| Tries to access non-local IPv4 and IPv6.                    |                                                                            |
|                                                             | Redirecting to captive portal.                                             |
| Clicks on IP Tunnel registration.                           |                                                                            |
|                                                             | Creates credentials for user and add him/her to CJDNS.                     |
|                                                             | Present credentials to user that he/she should add to their cjdroute.conf. |
| Adds credentials.                                           |                                                                            |
| Restarts CJDNS.                                             |                                                                            |
| Tada! Able to access Internet.                              |                                                                            |

## How-to

###Access point
####Topology
* Gateway 10.3.14.1
* Address 10.3.14.10-49
* Netmask 255.255.255.0
* DNS 10.3.14.1
* SSID TESTNET

###Router
####Topology
* eth0
  * Gateway 192.168.1.1
  * Address 192.168.1.3
  * Netmask 255.255.255.0
  * DNS 10.3.14.1
* eth1
  * Address 10.3.14.1
  * Netmask 255.255.255.0
* dhcp
  * Range 10.3.14.50 - 10.3.14.200
  * Broadcast 10.3.14.255
  * Routers 10.3.14.1
  * Lease time 600 - 7200
  * Domain name TESTNET
  * DNS 10.3.14.1
* dns
  * Interface eth0 & eth1
* router
  * Route traffic from port 80 and 443 (on eth1) to 10.3.14.1 

####Configuration
This was done on a machine with Ubuntu installed.

#####/etc/network/interfaces
Configuration for the TESTNET network:
```
# TESTNET network interface
auto eth1
iface eth1 inet static
  address 10.3.14.1
  netmask 255.255.255.0
  # Restore iptables
  post-up iptables-restore < /etc/iptables/rules
```

#####isc-dhcp-server
`dhcpd.conf` configuration:
```
ddns-update-style none;
authoritative;
log-facility local7;

subnet 10.3.14.0 netmask 255.255.255.0 {
	range 10.3.14.50 10.3.14.200;
	option broadcast-address 10.3.14.255;
	option routers 10.3.14.1;
	default-lease-time 600;
	max-lease-time 7200;
	option domain-name "TESTNET";
	option domain-name-servers 10.3.14.1;
}
```
#####dnsmasq
`dnsmasq.conf` configuration:
```
interface=eth1
```
Optionally, you could add `address=/#/10.3.14.1` to catch every DNS request and point to the server.

#####iptables
These are the rules that are used:
```
iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 10.3.14.1:80
iptables -t nat -A PREROUTING -p tcp --dport 443 -j DNAT --to-destination 10.3.14.1:443
```
You'd probably use `iptables-save` and `iptables-restore` for persistent rules, see below and `/etc/network/interfaces` configuration.
Saving the rules:
```
iptables-save > /etc/iptables.rules
```
