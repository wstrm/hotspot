# Hotspot
The idea is to have a CJDNS-only network, but before that, people want to be able to access the Internet.
This ~~is a~~ will be a general purpose captive portal.

I will have a kind of micro blog here, where I post my progress.

##2015-01-15



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
