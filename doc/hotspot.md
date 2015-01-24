# Hotspot
The idea is to have a CJDNS-only network, but before that, people want to be able to access the Internet.
This ~~is a~~ will be a general purpose captive portal.

I will have a kind of micro blog here, where I post my progress.

##2015-01-24

IP tunnel works! (using IPv6), this is how my setup looks like on two nodes (DigitalOcean):

###node0 (tunnel)
####Topology
* eth0
  * Address 2a03:b0c0:2:d0::1c0:f001/64
  * Gateway 2a03:b0c0:2:d0::1/64
* tun0
  * Address 2a03:b0c0:2:d0::1c0:f002/128

####Configuration
#####cjdroute.conf
```
"ipTunnel": {
  "allowedConnections":
    [
      {
        "publicKey": "****************************************************.k",
        "ip6Address": "2a03:b0c0:2:d0::1c0:f003",
        "ip6Prefix": 0
      }
    ],

    "outgoingConnections": []
}
```
#####ip
```
ip -6 addr add dev tun0 2a03:b0c0:2:d0::1c0:f002
ip -6 route add dev eth0 2a03:b0c0:2:d0::1
ip -6 route add dev tun0 2a03:b0c0:2:d0::1c0:f000/124 # My configurable range is 2a03:b0c0:2:d0::1c0:f000 - 2a03:b0c0:2:d0::1c0:f00f
ip -6 route add default via 2a03:b0c0:2:d0::1 # Not really necessary, but just in case
echo 1 > /proc/sys/net/ipv6/conf/all/forwarding
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf # Make forwarding permanent
```

I then ran `ping6 ipv6.google.com` on node1 and `tcpdump -i eth0 icmp6` node0, I was able to see the replies/requests, so it works!

###node1 (client)
####Topology
* tun0
  * Address 2a03:b0c0:2:d0::1c0:f003/0

####Configuration
```
"ipTunnel": {
  "allowedConnections":[],
  
  "outgoingConnections": [
    "****************************************************.k"
  ]
}
```

##2015-01-15

Ah, finally, got it working properly (everything except IP tunnel).
So this is my current setup:
###Access point
####Topology
* Gateway 10.3.14.1
* Address 10.3.14.10-49
* Netmask 255.255.255.0
* DNS 10.3.14.1
* SSID TESTNET

###HP G5 (router)
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
  * Route port 80 and 443 (on eth1) traffic to 10.3.14.1 

####Configuration
This was done on a Ubuntu machine.

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
These are the rules used:
```
iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 10.3.14.1:80
iptables -t nat -A PREROUTING -p tcp --dport 443 -j DNAT --to-destination 10.3.14.1:443
```
You'd probably use `iptables-save` and `iptables-restore` for persistent rules, see below and `/etc/network/interfaces` configuration.
Saving the rules:
```
iptables-save > /etc/iptables.rules
```

##2015-01-12
Took all the stuff to my school to set it up on the HP G5 and with the 2.4/5GHz access point.
Got the Raspberry Pi working with the new access point, but never finalized reconfiguration for the new settings.

I'm thinking of a network layout like this:
* Access point
	* Gateway 10.3.14.1
	* Address 10.3.14.10-49
	* Netmask 255.255.255.0
	* DNS 10.3.14.1
	* SSID TESTNET
* HP G5 (router + captive portal + cjdns + iptunnel)
	* eth0
		* Gateway 192.168.1.1
		* Address 192.168.1.3
		* Netmask 255.255.255.0
		* DNS 8.8.8.8, 8.8.4.4
	* eth1
		* Address 10.3.14.1
		* Netmask 255.255.255.0

The HP G5 should have iptables redirecting to `10.3.14.1` for all globally routable IP addresses.
Having `dnsmasq` hijacking all DNS requests and pointing them to `10.3.14.1` is also an option, not really sure about it yet thought.

Got the DHCP daemon installed on the server, using the following configuration.

```
subnet 10.3.14.0 netmask 255.255.255.0 {
	range 10.3.14.50 10.3.14.200;
	option broadcast-address 10.3.14.255;
	option routers 10.3.14.20;
	default-lease-time 600;
	max-lease-time 7200;
	option domain-name "TESTNET";
	option domain-name-servers 10.3.14.20;
}
```

##2015-01-11
So, I've started with a prototype for Hotspot. I'm going to use a Raspberry Pi and an old Access point I found.

Steps taken today:
* AP configured as follows:
```
Gateway: 192.168.1.20
Netmask: 255.255.255.0
Address: 192.168.1.10
DNS: 192.168.1.20
SSID: TESTNET
```
* Some stuff on the Raspberry Pi:
	* `apt-get install isc-dhcp-server`
		* Added subnet for new users to /etc/dhcp/dhcpd.conf
		```
		subnet 192.168.1.0 netmask 255.255.255.0 {
			range 192.168.1.50 192.168.1.200;
			option broadcast-address 192.168.1.255;
			option routers 192.168.1.20;
			default-lease-time 600;
			max-lease-time 7200;
			option domain-name "TESTNET";
			option domain-name-servers 192.168.1.20;
		}
		```
		* Commented some stuff in that config
		```
		# option domain-name "example.org";
		# option domain-name-servers ns1.example.org, ns2.example.org;
		```
		* And then uncommented `authoritative;`
	* Fixed a iptables rule
	```
	"iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.20:80"
	```
	* Compilled and ran CJDNS
	* Installed dnsmasq
		* Hijack DNS requests
		```
		echo 'address=/#/192.168.1.20' >> /etc/dnsmasq.conf # The address should point to the server running Hotspot
		```
	* Set up the Hotspot captive portal
