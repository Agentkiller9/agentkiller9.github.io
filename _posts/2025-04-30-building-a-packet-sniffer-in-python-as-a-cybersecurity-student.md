---
title: "Building a Packet Sniffer in Python as a Cybersecurity Student"
author: "Mujtaba Shaikeldin"
date: "2025-04-30 18:28:08"
categories: [packet-capture, cybersecurity, networking]
---

As a cybersecurity student, one of the most important lessons I’ve learned is that understanding what happens on a network — at the packet level — is essential. Tools like Wireshark are great for this, but I wanted to go a step further and build something myself. That’s what led me to create a custom packet sniffer using Python.

This project helped me build a deeper understanding of how data travels across networks and how packets are structured and interpreted. It also gave me practical experience with using Scapy, a powerful Python library for packet manipulation.

### Why I Built This

I wanted to:

*   Capture and view live network traffic.
*   Understand what Ethernet, IP, TCP, and ARP packets actually look like.
*   Learn how to store captured data in a format compatible with tools like Wireshark.
*   Improve my Python skills by building a tool from scratch that serves a real security purpose.

### Tools and Libraries Used

To build this packet sniffer, I used the following:

*   **Python** — for building the logic and handling the command-line interface.
*   **Scapy** — to capture and parse network packets.
*   **Colorama** — to format terminal output with colors.
*   **argparse** — to allow command-line arguments for interface selection and filtering.

### The Code

Here is the full code for the packet sniffer. It captures packets on a specified network interface, processes Ethernet, IP, TCP, and ARP layers, and saves the captured packets to a .pcap file that can be opened in Wireshark.

import argparse  
from scapy.all import sniff, Ether, IP, TCP, ARP  
from scapy.utils import wrpcap  
from colorama import Fore, Style, init  
from datetime import datetime  
import os  
import sys  
  
\# Initialize colorama  
init(autoreset=True)  
  
\# List to store captured packets  
captured\_packets = \[\]  
  
\# Function to process and display packets  
def packet\_callback(packet):  
    captured\_packets.append(packet)  
  
    print(f"\\n{Fore.CYAN}{'-'\*50}")  
    print(f"{Fore.GREEN}{Style.BRIGHT}📦 Packet Captured:")  
    print(f"{Fore.CYAN}{'-'\*50}{Style.RESET\_ALL}")  
  
    if packet.haslayer(Ether):  
        print(f"{Fore.YELLOW}🔸 Ethernet Frame:")  
        print(f"   {Fore.WHITE}Source MAC      : {packet\[Ether\].src}")  
        print(f"   Destination MAC : {packet\[Ether\].dst}")  
        print(f"{Fore.CYAN}{'-'\*50}{Style.RESET\_ALL}")  
  
    if packet.haslayer(IP):  
        print(f"{Fore.YELLOW}🌐 IP Packet:")  
        print(f"   {Fore.WHITE}Source IP       : {packet\[IP\].src}")  
        print(f"   Destination IP  : {packet\[IP\].dst}")  
        print(f"{Fore.CYAN}{'-'\*50}{Style.RESET\_ALL}")  
  
    if packet.haslayer(TCP):  
        print(f"{Fore.YELLOW}🔌 TCP Segment:")  
        print(f"   {Fore.WHITE}Source Port     : {packet\[TCP\].sport}")  
        print(f"   Destination Port: {packet\[TCP\].dport}")  
        print(f"{Fore.CYAN}{'-'\*50}{Style.RESET\_ALL}")  
  
    if packet.haslayer(ARP):  
        print(f"{Fore.YELLOW}📡 ARP Packet:")  
        print(f"   {Fore.WHITE}Sender MAC      : {packet\[ARP\].hwsrc}")  
        print(f"   Target MAC     : {packet\[ARP\].hwdst}")  
        print(f"   Operation      : {packet\[ARP\].op}")  
        print(f"{Fore.CYAN}{'-'\*50}{Style.RESET\_ALL}")  
  
\# Function to start sniffing  
def start\_sniffing(interface=None, count=0, bpf\_filter=None):  
    print(f"{Fore.GREEN}{Style.BRIGHT}🚀 Starting Packet Sniffer... Press Ctrl+C to stop.\\n")  
    try:  
        sniff(iface=interface, prn=packet\_callback, store=False, count=count, filter=bpf\_filter)  
    except KeyboardInterrupt:  
        print(f"\\n{Fore.YELLOW}⚡ Stopping capture...")  
    except PermissionError:  
        print(f"{Fore.RED}🚫 Permission denied! Try running as Administrator or root.")  
        sys.exit(1)  
    except Exception as e:  
        print(f"{Fore.RED}🚫 Error occurred: {e}")  
        sys.exit(1)  
    finally:  
        if captured\_packets:  
            timestamp = datetime.now().strftime("%Y%m%d\_%H%M%S")  
            pcap\_file = f"captured\_{timestamp}.pcap"  
            wrpcap(pcap\_file, captured\_packets)  
            print(f"\\n{Fore.MAGENTA}{Style.BRIGHT}📁 Packets saved to {pcap\_file}")  
        print(f"{Fore.GREEN}✅ Sniffing session ended.\\n")  
  
\# Main  
if \_\_name\_\_ == "\_\_main\_\_":  
    parser = argparse.ArgumentParser(description="Simple Packet Sniffer Tool")  
    parser.add\_argument("-i", "--interface", type=str, help="Interface to sniff on (e.g., eth0, wlan0)")  
    parser.add\_argument("-c", "--count", type=int, default=0, help="Number of packets to capture (0 for infinite)")  
    parser.add\_argument("-f", "--filter", type=str, help="BPF filter (e.g., 'tcp', 'udp', 'arp')")  
  
    args = parser.parse\_args()  
  
    start\_sniffing(interface=args.interface, count=args.count, bpf\_filter=args.filter)

### How It Works

When executed, the script uses Scapy’s sniff() function to start capturing packets. As each packet is received, the script checks for known layers—Ethernet, IP, TCP, and ARP—and prints out relevant details for each one.

If the script is interrupted (using Ctrl+C), it saves all the captured packets to a .pcap file using Scapy’s wrpcap() function, making it easy to analyze the traffic later in a graphical tool.

### Example Output

When packets are captured, the terminal displays a color-formatted breakdown of each packet. It shows MAC addresses, IP addresses, port numbers, and ARP operations if applicable.

![](https://cdn-images-1.medium.com/max/1024/1*vt8-uwX3vFZo8-QRIMe9ZQ.png)

### What I Learned

Working on this project taught me a lot about real-world networking. It helped me:

*   Understand protocol layers beyond just theory, by seeing real packet data in action.
*   Grasp the basics of packet sniffing and how network forensics is performed.
*   Explore how attackers might monitor traffic in insecure environments — and how defenders can detect it.
*   Strengthen my ability to use Python in a cybersecurity context, beyond scripting and automation.

It also helped reinforce key cybersecurity principles like data visibility, protocol analysis, and system permissions. For instance, I had to deal with permission issues when running the script, which made me more aware of how user privileges affect monitoring tools.

### Final Thoughts

This wasn’t just a coding exercise — it was a step toward thinking like a cybersecurity professional. By building a tool instead of just using one, I was able to see how data moves across a network, layer by layer.

If you’re a student in cybersecurity, I highly recommend doing something similar. It will sharpen your technical skills and give you a better appreciation for the tools and protocols that power the internet.

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=c24c8a2572d1)