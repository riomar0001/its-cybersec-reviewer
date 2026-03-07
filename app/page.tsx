"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Question = {
  id: number;
  question: string;
  options: [string, string, string, string] | string[];
  answer: number;
  category: string;
};

type AnswerRecord = {
  questionIndex: number;
  selected: number;
  correct: number;
};

type StartScreenProps = {
  onStart: () => void;
};

type QuizScreenProps = {
  questions: Question[];
  onFinish: (answers: AnswerRecord[], elapsed: number) => void;
};

type ResultScreenProps = {
  questions: Question[];
  answers: AnswerRecord[];
  elapsed: number;
  onRestart: () => void;
};

// ── QUESTIONS CONSTANT ──────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  { id: 1, question: "What is a common method to ensure Availability of systems?", options: ["Encryption", "Access control", "Data backups and disaster recovery plans", "Data masking"], answer: 2, category: "CIA Triad" },
  { id: 2, question: "An attacker successfully modifies the content of a company's website without being detected. Which aspect of the CIA Triad has been compromised?", options: ["Integrity", "Confidentiality", "None of these", "Availability"], answer: 0, category: "CIA Triad" },
  { id: 3, question: "Which of the following is NOT part of the CIA Triad?", options: ["Integrity", "Accountability", "Confidentiality", "Availability"], answer: 1, category: "CIA Triad" },
  { id: 4, question: "A company wants to ensure that if a file on a shared drive is accidentally deleted, a backup is always available to restore it. This action protects which aspect of the CIA Triad?", options: ["Integrity", "Confidentiality", "Availability", "Authentication"], answer: 2, category: "CIA Triad" },
  { id: 5, question: "What does the 'A' in the CIA Triad stand for?", options: ["Authorization", "Authentication", "Availability", "Access"], answer: 2, category: "CIA Triad" },
  { id: 6, question: "A government organization needs to ensure that classified documents cannot be accessed by unauthorized individuals. Which action will help protect Confidentiality?", options: ["Installing antivirus software on all machines", "Ensuring all files are backed up daily", "Performing regular file integrity checks", "Implementing access control policies based on clearance levels"], answer: 3, category: "CIA Triad" },
  { id: 7, question: "Which of the following best describes Availability in the CIA Triad?", options: ["Ensuring that data is accurate and consistent", "Ensuring that data can be accessed and used by authorized users whenever needed", "Ensuring that only authorized users can view the data", "Preventing unauthorized access to data"], answer: 1, category: "CIA Triad" },
  { id: 8, question: "Your organization experiences a power outage, and critical systems become unavailable. What action should you take to maintain Availability in the future?", options: ["Use a virtual private network (VPN) for remote access", "Use uninterruptible power supplies (UPS) and backup generators", "Implement access controls to restrict who can use the system", "Encrypt all data"], answer: 1, category: "CIA Triad" },
  { id: 9, question: "A Denial of Service (DoS) attack threatens which component of the CIA Triad?", options: ["Authorization", "Confidentiality", "Availability", "Integrity"], answer: 2, category: "CIA Triad" },
  { id: 10, question: "A company's customer database is breached, and the attackers steal sensitive information such as social security numbers and credit card details. Which part of the CIA Triad has been violated?", options: ["Integrity", "All of these", "Availability", "Confidentiality"], answer: 3, category: "CIA Triad" },
  { id: 11, question: "Which of the following would be a violation of Confidentiality?", options: ["Data being viewed by unauthorized personnel", "Data corruption due to a virus", "Data being lost because of insufficient backups", "System downtime due to hardware failure"], answer: 0, category: "CIA Triad" },
  { id: 12, question: "A customer-facing application is consistently crashing, preventing users from completing purchases. What part of the CIA Triad should be addressed?", options: ["Integrity", "Availability", "Confidentiality", "Authentication"], answer: 1, category: "CIA Triad" },
  { id: 13, question: "To ensure Integrity, what security measure should be implemented?", options: ["Regular audit and checksums", "Backing up data regularly", "Role-based access control", "Data encryption during transmission"], answer: 0, category: "CIA Triad" },
  { id: 14, question: "An example of maintaining Confidentiality would be:", options: ["Using encryption to protect sensitive data during transmission", "Using a hash function to ensure data integrity", "Regularly updated software to prevent system downtime", "Implementing redundant systems to prevent data loss"], answer: 0, category: "CIA Triad" },
  { id: 15, question: "Which of the following threats primarily affects the Integrity of data?", options: ["Altering records in a database", "Eavesdropping on communication", "Blocking access to a website", "Performing a brute-force attack to crack passwords"], answer: 0, category: "CIA Triad" },
  { id: 16, question: "An example of ensuring Integrity is:", options: ["Implementing hashing to verify data authenticity and accuracy", "Using access control mechanisms to restrict unauthorized data access", "Implementing multi-factor authentication for access control", "Using backups to prevent data loss"], answer: 0, category: "CIA Triad" },
  { id: 17, question: "A company's e-commerce website experiences an unexpected Denial of Service (DoS) attack, making the site inaccessible. Which part of the CIA Triad is impacted?", options: ["Integrity", "Availability", "Authentication", "Confidentiality"], answer: 1, category: "CIA Triad" },
  { id: 18, question: "Which of the following best describes Confidentiality in the CIA Triad?", options: ["Ensuring that systems are always available for use", "Ensuring that sensitive information is protected from unauthorized access", "Ensuring that authorized users have access to the data they need", "Ensuring that data has not been altered or tampered with"], answer: 1, category: "CIA Triad" },
  { id: 19, question: "What does the 'C' in CIA Triad stand for?", options: ["Consistency", "Cybersecurity", "Confidentiality", "Cryptography"], answer: 2, category: "CIA Triad" },
  { id: 20, question: "An attacker intercepts unencrypted emails sent between the HR department and employees. Which aspect of the CIA Triad has been violated?", options: ["Availability", "Integrity", "None of these", "Confidentiality"], answer: 3, category: "CIA Triad" },
  { id: 21, question: "Your organization needs to ensure that financial transaction data cannot be altered or tampered with once recorded. Which action is most appropriate to protect Integrity?", options: ["Implementing encryption for stored data", "Using digital signatures and checksums", "Implementing multi-factor authentication", "Regularly backing up transaction data"], answer: 1, category: "CIA Triad" },
  { id: 22, question: "Ensuring that only authorized individuals can access sensitive information is a concern of:", options: ["All of these", "Integrity", "Availability", "Confidentiality"], answer: 3, category: "CIA Triad" },
  { id: 23, question: "A healthcare provider uses an EHR system. To protect Confidentiality, which of the following actions should be taken?", options: ["Ensure the system is always online", "Implement checksums on all health records", "Keep a daily backup of all patient data", "Encrypt patient records and restrict access based on roles"], answer: 3, category: "CIA Triad" },
  { id: 24, question: "After a recent cyberattack, several users report unauthorized changes to important documents. What aspect of the CIA Triad has been compromised?", options: ["Availability", "Authentication", "Confidentiality", "Integrity"], answer: 3, category: "CIA Triad" },
  { id: 25, question: "You notice that an internal database containing financial records is accessible to every employee, regardless of their role. Which part of the CIA Triad is at risk?", options: ["Authentication", "Availability", "Integrity", "Confidentiality"], answer: 3, category: "CIA Triad" },
  { id: 26, question: "A financial institution wants to guarantee that customers can access their banking services 24/7. Which action should the institution take to protect Availability?", options: ["Conduct regular data integrity audits", "Restrict customer access to non-business hours", "Encrypt customer data during transactions", "Implement redundant servers and failover mechanisms"], answer: 3, category: "CIA Triad" },
  { id: 27, question: "A company notices employees have accidentally overwritten important files. Which Integrity measure should be implemented to prevent this?", options: ["Encrypting the files to prevent unauthorized access", "Using access control lists to restrict write permissions", "Installing firewalls to prevent external access", "Performing daily backups of all files"], answer: 1, category: "CIA Triad" },
  { id: 28, question: "Your company stores sensitive customer data in a cloud database. What would be the best approach to ensure Confidentiality?", options: ["Regularly backing up the data", "Allowing all employees access to the database", "Encrypting the data both at rest and in transit", "Disabling antivirus software to improve performance"], answer: 2, category: "CIA Triad" },
  { id: 29, question: "Which of the following controls help in protecting Availability?", options: ["Redundant systems and failover mechanisms", "Digital signatures", "Firewalls", "Multi-factor authentication"], answer: 0, category: "CIA Triad" },
  { id: 30, question: "Integrity in the CIA Triad refers to:", options: ["Ensuring data is available when needed", "Ensuring data is accurate and has not been altered without authorization", "Keeping data confidential and protected", "Protecting against unauthorized access to data"], answer: 1, category: "CIA Triad" },
  { id: 31, question: "What protects the credit card information of individuals?", options: ["FERPA", "HIPAA", "GDPR", "PCI DSS"], answer: 3, category: "Regulations" },
  { id: 32, question: "Which command displays both configured DNS server information and the IP address resolution for a URL?", options: ["Nslookup", "Traceroute", "Nmap", "Ping"], answer: 0, category: "Network Commands" },
  { id: 33, question: "Which security mechanism ensures that data cannot be modified or altered during transmission?", options: ["Access control", "Two-factor authentication", "Hashing", "Encryption"], answer: 2, category: "Security Mechanisms" },
  { id: 35, question: "You recommend purchasing insurance and hiring another organization to maintain the web server. Which risk mitigation strategy is this?", options: ["Risk Reduction", "Risk Avoidance", "Risk Transfer", "Risk Acceptance"], answer: 2, category: "Risk Management" },
  { id: 36, question: "You are working with the senior admin team to identify potential risks. Which phase of risk management are you in?", options: ["Risk Assessment", "Risk Identification", "Risk Mitigation", "Risk Monitoring"], answer: 1, category: "Risk Management" },
  { id: 37, question: "What protects information about individuals that is stored by federal agencies?", options: ["Privacy Act of 1974", "FERPA", "HIPAA", "PCI DSS"], answer: 0, category: "Regulations" },
  { id: 38, question: "What protects the educational records of individuals?", options: ["HIPAA", "GDPR", "PCI DSS", "FERPA"], answer: 3, category: "Regulations" },
  { id: 39, question: "What protects the personal information of members of the European Union?", options: ["HIPAA", "FERPA", "PCI DSS", "GDPR"], answer: 3, category: "Regulations" },
  { id: 40, question: "What protects the health care information of individuals?", options: ["PCI DSS", "GDPR", "HIPAA", "FERPA"], answer: 2, category: "Regulations" },
  { id: 41, question: "You need to connect two network switches without using an uplink port or any additional hardware. What type of cable should you use?", options: ["Crossover cable", "Straight-through cable", "Serial cable", "Fiber optic cable"], answer: 0, category: "Networking" },
  { id: 42, question: "What type of cable would be used to connect a router to a switch?", options: ["Crossover cable", "Coaxial cable", "Straight-through cable", "Serial cable"], answer: 2, category: "Networking" },
  { id: 43, question: "Which of the following is a key characteristic of a static IP address?", options: ["It is assigned by a DHCP server automatically.", "It is used only in wireless networks.", "It remains the same each time a device connects to the network.", "It changes every time a device connects to the network."], answer: 2, category: "IP Addressing" },
  { id: 44, question: "A device on your network keeps receiving a different IP address every time it reconnects. What type of IP addressing is being used?", options: ["Public IP addressing", "Dynamic IP addressing", "Static IP addressing", "Manual IP addressing"], answer: 1, category: "IP Addressing" },
  { id: 45, question: "You want to display your IP address, subnet mask, and default gateway. Which command will show this information?", options: ["ipconfig /release", "ping /ipconfig", "ipconfig", "netstat"], answer: 2, category: "Network Commands" },
  { id: 46, question: "Which topology is often used in wireless networks and connects devices to a central point?", options: ["Mesh topology", "Ring topology", "Star topology", "Bus topology"], answer: 2, category: "Network Topologies" },
  { id: 47, question: "In which network topology is data sent in one direction around a circular loop?", options: ["Ring topology", "Bus topology", "Mesh topology", "Star topology"], answer: 0, category: "Network Topologies" },
  { id: 48, question: "What is the key difference in the wiring of a straight-through and a crossover cable?", options: ["Straight-through cables use a different color code standard than crossover cables.", "Crossover cables use different connector types at each end.", "A crossover cable swaps the transmit and receive wire pairs at one end.", "The pinouts are identical for both cables."], answer: 2, category: "Networking" },
  { id: 49, question: "You need to configure a web server with a permanent IP address that will not change over time. Which type of IP address should you assign?", options: ["Temporary IP address", "Dynamic IP address", "Static IP address", "Private IP address"], answer: 2, category: "IP Addressing" },
  { id: 50, question: "A network administrator wants to configure a web server so that it always has the same IP address. Which type of IP addressing should they use?", options: ["Dynamic IP address", "Temporary IP address", "Static IP address", "Public IP address"], answer: 2, category: "IP Addressing" },
  { id: 51, question: "You want to check if your computer can reach the network gateway with IP address 192.168.1.1. What should you type?", options: ["ping -r 192.168.1.1", "ping -gateway 192.168.1.1", "ipconfig 192.168.1.1", "ping 192.168.1.1"], answer: 3, category: "Network Commands" },
  { id: 52, question: "When would you use a crossover cable instead of a straight-through cable?", options: ["To connect two similar devices, like two PCs or two switches.", "To connect two different types of devices, like a PC and a router", "To connect a PC to a switch", "To connect a PC to a printer"], answer: 0, category: "Networking" },
  { id: 53, question: "Which type of cable is used to connect a computer to a switch or hub?", options: ["Fiber optic cable", "Crossover cable", "Straight-through cable", "Coaxial cable"], answer: 2, category: "Networking" },
  { id: 54, question: "What does the ipconfig command do on a Windows computer?", options: ["Displays the IP address configuration of the network interface.", "Configures firewall settings.", "Assigns a new IP address to the network.", "Checks the speed of the network connection."], answer: 0, category: "Network Commands" },
  { id: 55, question: "A user connected to a network that uses DHCP receives a new IP address every time they disconnect and reconnect. What type of IP address is being used?", options: ["Reserved IP address", "Static IP address", "Dynamic IP address", "Manual IP address"], answer: 2, category: "IP Addressing" },
  { id: 56, question: "A small office is concerned about the network failing if the main cable breaks. Which topology should they avoid?", options: ["Bus topology", "Ring topology", "Mesh topology", "Star topology"], answer: 0, category: "Network Topologies" },
  { id: 57, question: "Your router's IP address is 192.168.0.1. Which command will help you check connectivity?", options: ["ipconfig /check 192.168.0.1", "ipconfig /ping 192.168.0.1", "ping 192.168.0.1", "netstat 192.168.0.1"], answer: 2, category: "Network Commands" },
  { id: 58, question: "Which color-coded wiring standard is commonly used for straight-through cables?", options: ["TG568A on one end and no standard on the other", "T568B on both ends", "T568A on both ends", "T568B on one end and T568A on the other"], answer: 1, category: "Networking" },
  { id: 59, question: "In a ring topology, if one device fails, what happens to the network?", options: ["The entire network is disrupted.", "Traffic is automatically rerouted around the failed device.", "The network continues to function normally.", "Only the failed device is affected."], answer: 0, category: "Network Topologies" },
  { id: 60, question: "Which of the following statements is true regarding straight-through cables?", options: ["They are used exclusively for fiber optic connections.", "They are used to connect similar devices, such as computer to a computer.", "They swap the transmit and receive pairs at one end.", "They use the same wiring configuration on both ends."], answer: 3, category: "Networking" },
  { id: 61, question: "What happens if a device is set to obtain an IP address automatically?", options: ["The device sends a request to the DHCP server to obtain an IP address dynamically.", "The device uses a static IP address.", "The device assigns itself an IP address from a predefined pool.", "The device can only communicate within the local network."], answer: 0, category: "IP Addressing" },
  { id: 62, question: "Which protocol is responsible for dynamically assigning IP addresses in a network?", options: ["FTP", "HTTP", "DNS", "DHCP"], answer: 3, category: "Networking" },
  { id: 63, question: "Which topology is most suitable for a small office with few devices and limited budget?", options: ["Mesh topology", "Star topology", "Ring topology", "Bus topology"], answer: 3, category: "Network Topologies" },
  { id: 64, question: "An organization has a network where data travels in one direction around a loop, but if any device fails, the entire network becomes inoperable. Which topology are they using?", options: ["Bus topology", "Star topology", "Ring topology", "Mesh topology"], answer: 2, category: "Network Topologies" },
  { id: 65, question: "Which of the following is a characteristic of a star topology?", options: ["Each device is connected to two other devices, forming a ring.", "All devices are connected to a central hub or switch.", "Devices are connected in a closed loop.", "Devices are connected in a linear fashion."], answer: 1, category: "Network Topologies" },
  { id: 66, question: "You are setting up a home network and need to connect your computer directly to your router. Which cable type should you use?", options: ["Fiber optic cable", "Crossover cable", "Coaxial cable", "Straight-through cable"], answer: 3, category: "Networking" },
  { id: 67, question: "What is a key disadvantage of a bus topology?", options: ["It is expensive to set up.", "If the central hub fails, the entire network goes down.", "If the main cable fails, the whole network is disrupted.", "Devices must be manually configured to communicate."], answer: 2, category: "Network Topologies" },
  { id: 68, question: "A client cannot access a website. You decide to check if their computer can reach the default gateway at 192.168.1.1. Which command will you use?", options: ["ipconfig 192.168.1.1", "ping 192.168.1.1", "ipconfig /renew 192.168.1.1", "netstat 192.168.1.1"], answer: 1, category: "Network Commands" },
  { id: 69, question: "All computers are connected to a central switch. If one computer fails, the network is unaffected, but if the switch fails, the entire network goes down. Which topology are they using?", options: ["Star topology", "Bus topology", "Ring topology", "Mesh topology"], answer: 0, category: "Network Topologies" },
  { id: 70, question: "What is the main disadvantage of using a static IP address in a large organization?", options: ["It requires manual configuration for each device.", "It cannot be used for servers.", "It is slower than dynamic IP addressing.", "It changes frequently and causes conflicts."], answer: 0, category: "IP Addressing" },
  { id: 71, question: "A hospital needs a network that connects departments through a central point and allows easy addition or removal of devices. Which topology is most suitable?", options: ["Mesh topology", "Ring topology", "Bus topology", "Star topology"], answer: 3, category: "Network Topologies" },
  { id: 72, question: "What does the ping command do?", options: ["Opens a port for a network service.", "Checks the network connectivity between your device and another device.", "Checks for packet loss in the network.", "Changes the IP address of a device."], answer: 1, category: "Network Commands" },
  { id: 73, question: "You are helping set up a peer-to-peer connection between two laptops using an Ethernet cable. What type of cable would you most likely use?", options: ["Crossover cable", "USB cable", "Straight-through cable", "Coaxial cable"], answer: 0, category: "Networking" },
  { id: 74, question: "A university wants to connect all LANs with the highest redundancy and fault tolerance. Which topology should they use?", options: ["Star topology", "Bus topology", "Mesh topology", "Ring topology"], answer: 2, category: "Network Topologies" },
  { id: 75, question: "Which of the following devices would typically require a crossover cable for a direct connection?", options: ["Computer to switch", "Router to modem", "Switch to switch", "Computer to printer"], answer: 2, category: "Networking" },
  { id: 76, question: "You want each printer to have a permanent IP address. What type of IP addressing should you use?", options: ["Static IP address", "Dynamic IP address", "Public IP address", "Automatic IP address"], answer: 0, category: "IP Addressing" },
  { id: 77, question: "In which situation would a static IP address be preferable over a dynamic IP address?", options: ["For a device that frequently moves between different networks.", "For public Wi-Fi access points.", "For a home computer that connects to the internet periodically.", "For a device that needs to be easily located on a network, such as a web server."], answer: 3, category: "IP Addressing" },
  { id: 78, question: "In which topology do all devices share a single communication line or cable?", options: ["Mesh topology", "Bus topology", "Ring topology", "Star topology"], answer: 1, category: "Network Topologies" },
  { id: 79, question: "Which network topology connects each device to every other device in the network?", options: ["Ring topology", "Mesh topology", "Bus topology", "Star topology"], answer: 1, category: "Network Topologies" },
  { id: 80, question: "A software company wants a topology where all devices are connected in sequence along a single cable, with minimal cost. Which topology should they choose?", options: ["Bus topology", "Mesh topology", "Ring topology", "Star topology"], answer: 0, category: "Network Topologies" },
  { id: 81, question: "Which IP address is the loopback address, often used for testing the local network interface?", options: ["127.0.0.1", "192.168.1.1", "8.8.8.8", "10.0.0.1"], answer: 0, category: "IP Addressing" },
  { id: 82, question: "A network technician needs to check the subnet mask assigned to their computer. Which command should they use?", options: ["tracert", "netstat", "ping", "ipconfig"], answer: 3, category: "Network Commands" },
  { id: 83, question: "Which of the following is a typical cost-related aspect of static IP addresses compared to dynamic ones?", options: ["IP addresses are usually free to obtain", "Dynamic IP addresses are always more expensive than static IPs", "Static IP addresses are often more expensive", "Static IP addresses decrease overall network costs"], answer: 2, category: "IP Addressing" },
  { id: 84, question: "A manager wants to share a folder with the accounting team with password protection. What is the best way to secure access?", options: ["Encrypt the folder and send the decryption key to the team", "Create a shared folder with password protection and assign specific users access", "Hide the folder from the network", "Email the folder to each accounting team member"], answer: 1, category: "Networking" },
  { id: 85, question: "A user runs the ping command but the result shows 'Request timed out.' What does this indicate?", options: ["The local computer is misconfigured.", "The remote server is not reachable, possibly offline or disconnected.", "The DNS server is down", "The server is online but unreachable due to a firewall"], answer: 1, category: "Network Commands" },
  { id: 86, question: "A user's home devices have different IP addresses each time they reconnect to the Wi-Fi. What type of IP address configuration is being used?", options: ["Dynamic IP address", "Manual IP configuration", "Loopback IP address", "Static IP address"], answer: 0, category: "IP Addressing" },
  { id: 87, question: "What is the role of the default gateway in a network?", options: ["It assigns IP addresses to devices on the network", "It translates domain names to IP addresses", "It resolves IP addresses into MAC addresses", "It routes traffic from the local network to other networks, such as the internet"], answer: 3, category: "Networking" },
  { id: 88, question: "A family has several smart home devices that do not need to be accessed from outside the home. Which type of IP address setup is best?", options: ["Private IP address", "Dynamic IP address", "Public IP address", "Static IP address"], answer: 0, category: "IP Addressing" },
  { id: 89, question: "The network in a small office suddenly stops working. The office uses a switch to connect all devices to the router. What is the most likely cause?", options: ["The router has assigned duplicate IP addresses", "The internet service provider is down", "The Ethernet cables are unplugged from the computers", "The switch has failed"], answer: 3, category: "Networking" },
  { id: 90, question: "You are setting up a wired network using a combination of routers and switches. What type of cable would you use to connect the computers to the switch and the switch to the router?", options: ["Coaxial cable", "Crossover Ethernet Cable", "Fiber optic cable", "Straight-through Ethernet cable"], answer: 3, category: "Networking" },
  { id: 91, question: "A user receives an 'Access Denied' message when trying to access a shared folder, but other users can access it. What should the network administrator check?", options: ["The user's permission settings on the shared folder", "The availability of the cloud storage service", "The server's physical connection to the network", "The user's connection to the internet"], answer: 0, category: "Networking" },
  { id: 92, question: "A user needs to know the IP address of their default gateway to troubleshoot an internet connection problem. Which command should they run?", options: ["ipconfig", "netstat", "ping localhost", "tracert"], answer: 0, category: "Network Commands" },
  { id: 93, question: "You are setting up a web server that needs to be consistently accessible over the internet using the same IP address. Which type is most suitable?", options: ["Private IP address", "Loopback IP address", "Static IP address", "Dynamic IP address"], answer: 2, category: "IP Addressing" },
  { id: 94, question: "Employees report that accessing files from the shared folder is slow when multiple users access it simultaneously. What could be the cause?", options: ["The folder sharing feature is disabled.", "The network cable connecting the server to the switch is faulty.", "The server hosting the shared folder is experiencing high traffic and bandwidth limitations", "The folder is too large to be shared over the network"], answer: 2, category: "Networking" },
  { id: 95, question: "A company wants to assign a permanent, fixed IP address to one of its servers. Which type should they use?", options: ["A floating IP address", "Dynamic IP address", "A temporary IP address", "A static IP address"], answer: 3, category: "IP Addressing" },
  { id: 96, question: "A medium-sized office needs to connect 20 computers to the network, but the router only has four LAN ports. How can this be configured?", options: ["Use four routers to connect all the computers", "Connect all the computers wirelessly to the router", "Use a second router to expand the network", "Connect a switch to the router and plug all computers into the switch"], answer: 3, category: "Networking" },
  { id: 97, question: "Branch offices need to communicate with a central data center using a fixed IP address. Which type of IP address should they use?", options: ["Local IP address", "Static IP address", "Public IP address", "Dynamic IP address"], answer: 1, category: "IP Addressing" },
  { id: 98, question: "Your router uses a service that automatically assigns IP addresses to devices without requiring manual configuration. What is this service?", options: ["DNS (Domain Name System)", "NAT (Network Address Translation)", "IPAM (IP Address Management)", "DHCP (Dynamic Host Configuration Protocol)"], answer: 3, category: "Networking" },
  { id: 99, question: "Why might static IP addresses be less secure than dynamic IP addresses in some situations?", options: ["Static IP addresses are more difficult to manage", "Static IP addresses cannot be encrypted", "Static IP addresses can easily be guessed or targeted for attacks", "Static IP addresses are not supported by all internet service providers"], answer: 2, category: "IP Addressing" },
  { id: 100, question: "A manager wants to share a folder with employees connected to the same local network. What is the most appropriate way to share the folder?", options: ["Create individual email accounts for each employee and email the folder to them", "Upload the folder to a cloud service and share the link with the employees", "Copy the folder to each employee's computer using a USB drive", "Enable folder sharing in the operating system and give network users access"], answer: 3, category: "Networking" },
  { id: 101, question: "Your home router assigns different IP addresses to devices that connect to it at different times, automatically. What type of IP address is being used?", options: ["A manual IP address", "A dynamic IP address", "Static IP address", "A permanent IP address"], answer: 1, category: "IP Addressing" },
  { id: 102, question: "A user is unable to access the internet though connected through a switch. Other computers on the same switch work fine. Which is the most likely cause?", options: ["The computer's IP address is conflicting with another device", "The Ethernet cable to the user's computer is faulty", "The switch is not working", "The router is misconfigured"], answer: 1, category: "Networking" },
  { id: 103, question: "A company wants to expand its network to accommodate 10 additional computers. All router ports are in use. What is the best solution?", options: ["Install a second router and connect it to the network", "Replace the current router with a larger one that has more ports", "Connect a switch to the router and then connect the additional computers to the switch", "Use Wi-Fi to connect the new computers without any changes to the router"], answer: 2, category: "Networking" },
  { id: 104, question: "A user hosts an online service from home using a dynamic IP address. Their IP address changes, making the service inaccessible. What can they do to prevent this?", options: ["Switch to a static IP address", "Use a VPN", "Restart the service frequently", "Disable DHCP on the router"], answer: 0, category: "IP Addressing" },
  { id: 105, question: "A user wants to check the IP address configuration of their computer, including IP address, subnet mask, and default gateway. Which command should they run?", options: ["netstat", "tracert", "ipconfig", "ping"], answer: 2, category: "Network Commands" },
  { id: 106, question: "A user wants to test if their local network adapter is functioning properly by sending data packets to itself. Which command should be used?", options: ["ping 127.0.0.1", "tracert 8.8.8.8", "192.168.1.1", "ipconfig /all"], answer: 0, category: "Network Commands" },
  { id: 107, question: "The finance department needs to share a folder with operations, but sensitive files should only be accessible to finance. How should this be set up?", options: ["Share the folder with both departments and restrict access to the entire folder", "Use encryption software to encrypt the sensitive files before sharing", "Email sensitive files to finance team members and share the rest with operations", "Create subfolders with specific permissions for finance on sensitive data, and shared permissions for general files"], answer: 3, category: "Networking" },
  { id: 108, question: "A small startup needs internet connectivity with a limited budget. They don't need consistent IP addresses. Which IP address type is most appropriate?", options: ["Static IP address", "Dynamic IP address", "Reserved IP address", "Private IP address"], answer: 1, category: "IP Addressing" },
  { id: 109, question: "You are troubleshooting a network issue and want to check if your computer can reach another device by sending packets of data to it. Which command would you use?", options: ["ping", "route", "nslookup", "ipconfig"], answer: 0, category: "Network Commands" },
  { id: 110, question: "A gaming enthusiast wants to host a game server from home so friends can always connect to the same IP address. What should he use?", options: ["Use a dynamic IP address", "Restart the router frequently", "Use a private IP address", "Use a static IP address"], answer: 3, category: "IP Addressing" },
  { id: 111, question: "An employee is unable to access a shared folder on the network, but other employees can. What is the most likely cause?", options: ["The employee's computer has a firewall blocking the connection", "The shared folder is not properly configured", "The employee's computer is not connected to the network", "The employee is using the wrong username and password"], answer: 3, category: "Networking" },
  { id: 112, question: "A department head wants certain sensitive files in a shared folder accessible only by themselves. How should permissions be configured?", options: ["Set full access for all users", "Remove the sensitive files from the shared folder entirely", "Set specific permissions on sensitive files so only the department head can access them", "Use read-only access for all users"], answer: 2, category: "Networking" },
  { id: 113, question: "A company wants to connect two offices so that employees can share files and resources across both networks. What is the best way?", options: ["Connect the two switches using an Ethernet cable", "Connect the two routers using a crossover Ethernet cable", "Use Wi-Fi to connect the two offices", "Use a second router to bridge the two networks"], answer: 1, category: "Networking" },
  { id: 114, question: "Which of the following is an advantage of using dynamic IP addresses?", options: ["The same IP address is retained forever", "Provides faster internet speeds", "More secure for long-term use", "Easier to configure and manage"], answer: 3, category: "IP Addressing" },
  { id: 115, question: "Which type of IP address is commonly used by ISPs for home internet connections?", options: ["Static IP address", "Private IP address", "Dynamic IP address", "IPv6"], answer: 2, category: "IP Addressing" },
  { id: 116, question: "You want to access a surveillance camera remotely, but the dynamic IP changes frequently. What is the most suitable IP address for this scenario?", options: ["Dynamic IP address", "Localhost IP address", "Static IP address", "Private IP address"], answer: 2, category: "IP Addressing" },
  { id: 117, question: "A business is setting up a web server accessible to clients globally, and the server must always have the same IP address. Which type is best?", options: ["Dynamic IP address", "Static IP address", "Public IP address", "Private address"], answer: 1, category: "IP Addressing" },
  { id: 118, question: "Which of the following is a disadvantage of using static IP addresses?", options: ["They require more configuration and management", "They are less reliable for hosting servers", "The IP address can change automatically", "Static IP addresses are not accessible over the internet"], answer: 0, category: "IP Addressing" },
  { id: 119, question: "A small office has five computers that need to connect to the internet and communicate with each other. How should the network devices be configured?", options: ["Connect the router to the ISP and use wireless connections for all computers", "Connect all computers directly to the router using Ethernet cables", "Connect all computers to the switch using Ethernet cables, and connect the switch to the router", "Connect each computer to the internet using its own modem"], answer: 2, category: "Networking" },
  { id: 120, question: "You discover that two computers have the same IP address, causing a conflict. What should you do?", options: ["Restart both computers", "Reboot the router", "Disable the firewall on the router", "Change the IP address of one of the computers"], answer: 3, category: "IP Addressing" },
  { id: 124, question: "The accounting department receives an email with a hyperlink pointing to an unknown party for a financial regulation webinar. What type of cybersecurity threat should you investigate?", options: ["Vishing", "Spear Phishing", "Smishing", "Ransomware"], answer: 1, category: "Cybersecurity Threats" },
  { id: 125, question: "You need to allow employees to access your company's secure network from their homes. Which type of security should you implement?", options: ["RIP", "VPN", "MP", "IDS"], answer: 1, category: "Security Mechanisms" },
  { id: 126, question: "You need to transfer configuration files to a router across an unsecured network. Which protocol should you use to encrypt the files in transit?", options: ["telnet", "ssh", "tftp", "http"], answer: 1, category: "Security Mechanisms" },
  { id: 127, question: "Your home network has slowed down and an unknown host is attached. What should you do to prevent this specific host from attaching again?", options: ["Change the network SSID", "Implement MAC address filtering", "Block the host IP address", "Create an IP access control list"], answer: 1, category: "Network Security" },
  { id: 128, question: "You need to filter the websites available to employees on the company network. Which type of device should you deploy?", options: ["Proxy Server", "Honey Pot", "IDS", "IPS"], answer: 0, category: "Network Security" },
  { id: 129, question: "An online shopping store's website keeps crashing after being restarted. You suspect a cyberattack. Which type should you investigate?", options: ["Ransomware", "Social Engineering", "Spear Phishing", "Denial of Service (DoS)"], answer: 3, category: "Cybersecurity Threats" },
  { id: 134, question: "What is the purpose of a hypervisor?", options: ["It creates and runs virtual machines", "It provides and services a gateway between users and the internet", "It monitors and logs network traffic for malicious packets", "It provides and monitors firewall services for cloud computing"], answer: 0, category: "Virtualization" },
  { id: 135, question: "You issue a 'netstat -l' command to display all TCP ports in the listening state. What does the listening state indicate?", options: ["Remote and disconnected and the ports are closing", "The state of the connection on the ports is unknown", "The ports are actively connected to another system or process", "The ports are open on the system and are waiting for connections"], answer: 3, category: "Network Commands" },
  { id: 137, question: "What enables the network security team to keep track of OS versions, security updates and patches on end user devices?", options: ["Security Policies and Procedures", "Asset Management", "Business Continuity Planning", "Incident Management"], answer: 1, category: "Security Management" },
  { id: 140, question: "Your IEM system alerts you that users are connecting to an unusual URL. What should you do first?", options: ["Submit the URL to the threat intelligence portal for analysis", "Visit the URL to determine whether the website is legitimate", "Ask users why they visited the website", "Block the URL by placing it on the network block list"], answer: 0, category: "Incident Response" },
  { id: 142, question: "A corporation hires cyber criminals to create a prolonged presence on a competitor's network to steal or sabotage sensitive data. Which type of attack does this describe?", options: ["Man-in-the-Middle", "DDOS", "Ransomware", "APT (Advanced Persistent Threat)"], answer: 3, category: "Cybersecurity Threats" },
  { id: 143, question: "You are reviewing SIEM output and see a valid incident with malicious files detected by IDS. What should you do next?", options: ["Escalate the situation immediately", "Update the documentation to include the new alert information", "Log the alert and watch for a second occurrence", "Prepare notes to present at the weekly cybersecurity team meeting"], answer: 0, category: "Incident Response" },
  { id: 144, question: "You just completed a full scan of a Windows 10 PC. Where should you go to view the scan results?", options: ["Windows Application Logs", "Windows Task Manager", "Windows System Logs", "Windows Security"], answer: 3, category: "Security Tools" },
  { id: 148, question: "A hacker gained root access to a Linux server by accessing it as a guest and using a program to bypass the root password. Which type of endpoint attack is this?", options: ["Buffer Overflow", "Privilege Escalation", "DDOS", "Brute Force"], answer: 1, category: "Cybersecurity Threats" },
  { id: 149, question: "To do online banking, a user enters a password then enters a 5-digit code sent to their smartphone. What type of authentication does this describe?", options: ["Multifactor Authentication", "Radius", "Triple", "VPN"], answer: 0, category: "Authentication" },
  { id: 150, question: "Employees report the company's intranet site is no longer accepting login info. You notice misspellings on the site, but it functions normally via IP address. What should you do?", options: ["Restore a backup copy of the authentication database", "Update the web server software to the latest version", "Take the company web portal offline immediately", "Verify the accuracy of the entry for the site in the local DNS server"], answer: 3, category: "Network Security" },
  { id: 151, question: "You observe that the DNS server is sending messages with warning severity in the syslog. What do these messages indicate?", options: ["An error condition is occurring that must be addressed immediately", "The DNS server is unusable due to a severe malfunction and is shutting down", "A condition exists that will cause errors in the future if the issue is not fixed", "The server has a hardware error that does not require immediate attention"], answer: 2, category: "Network Security" },
  { id: 152, question: "Which wireless encryption technology requires AES to secure home wireless networks?", options: ["TKIP", "WPA3", "WEP", "WPA2"], answer: 3, category: "Network Security" },
  { id: 153, question: "What does hashing provide for data communication?", options: ["Origin Authentication", "Data Integrity", "Data Non-Repudiation", "Data Encryption"], answer: 1, category: "Security Mechanisms" },
  { id: 155, question: "Which activity is an example of an exploit attempting to gain user credentials?", options: ["Obtaining a directory listing of files located on the web database server", "Installing a backdoor in order to enable two-way communication with the device", "Sending an email with a link to a fictitious web portal login page", "Executing a remote port scan of all the enterprise registered IP addresses"], answer: 2, category: "Cybersecurity Threats" },
  { id: 158, question: "You need to implement a multifactor authentication system for physical access to a building, currently using only a fingerprint scan. What additional factor should you add?", options: ["Facial Recognition", "Voiceprint Analysis", "Retinal Scan", "ID Card"], answer: 3, category: "Authentication" },
  { id: 160, question: "A network administrator discovered that a public IP address has been able to access the company's private internal network. What should be done?", options: ["Update the IP address range for all computers on the internal network", "Have all users renew their DHCP address", "Block external IP addresses from the private network segment", "Update security software on all clients currently connected to the private network"], answer: 2, category: "Network Security" },
  { id: 162, question: "Which command displays both the configured DNS server information and the IP address resolution for a URL?", options: ["nslookup", "traceroute", "ping", "NMap"], answer: 0, category: "Network Commands" },
  { id: 165, question: "Which encryption type is used to secure WiFi networks?", options: ["RISA (Rivest Shamir Adleman)", "Triple Data Encryption Standard (Triple DES)", "Advanced Encryption Standard (AES)", "Data Encryption Standard"], answer: 2, category: "Network Security" },
  { id: 168, question: "You analyze a Mac console output showing SSH login events. Based on the output, which event has occurred?", options: ["A user is attempting a brute force attack", "A user has failed to establish an encrypted connection via a terminal", "A user is a victim of SYN flood attack", "A user has established an encrypted connection via a terminal application"], answer: 3, category: "Security Analysis" },
  { id: 170, question: "What security assessment ensures that IT systems where PII data is available, accurate, confidential, and accessible only by authorized personnel?", options: ["Risk Framing", "Information Assurance", "Cyber Kill Chain", "Workflow Management"], answer: 1, category: "Security Management" },
  { id: 171, question: "You find a USB Flash drive on the floor of the computer lab. You connect it and antivirus warns you of a malware infection. What type of social engineering attack is this?", options: ["Phishing", "Baiting", "Vishing", "Whaling"], answer: 1, category: "Cybersecurity Threats" },
  { id: 172, question: "In the Diamond Model for intrusion analysis, what does the Capability node represent?", options: ["Malware tools and techniques used by the intruder during the attack.", "IP addresses, domain names and email addresses of the attack source", "Network assets, critical processes and customer data stored on the network", "People or organization initiating the intrusion in order to achieve a goal"], answer: 0, category: "Security Analysis" },
  { id: 173, question: "You need to transfer configuration files to a router across an unsecured network. Which protocol should you use to encrypt the files in transit? (v2)", options: ["ssh", "http", "tftp", "telnet"], answer: 0, category: "Security Mechanisms" },
  { id: 174, question: "You need to allow employees to access your company's secure network from their homes. Which type of security should you implement? (v2)", options: ["MP", "IDS", "VPN", "RIP"], answer: 2, category: "Security Mechanisms" },
  { id: 175, question: "Your home network has slowed down and you notice an unknown host attached. What should you do to prevent this specific host from attaching again? (v2)", options: ["Change the network SSID", "Implement MAC address filtering", "Create an IP access control list", "Block the host IP address"], answer: 1, category: "Network Security" },
  { id: 176, question: "The accounting department receives an email with a hyperlink pointing to an unknown party for a financial regulation webinar. What type of cybersecurity threat should you investigate? (v2)", options: ["Ransomware", "Smishing", "Vishing", "Spear Phishing"], answer: 3, category: "Cybersecurity Threats" },
  { id: 178, question: "What protects information about individuals that is stored by federal agencies? (v2)", options: ["Privacy Act of 1974", "FERPA", "HIPAA", "PCI DSS"], answer: 0, category: "Regulations" },
  { id: 180, question: "What protects the health care information of individuals? (v2)", options: ["FERPA", "PCI DSS", "HIPAA", "GDPR"], answer: 2, category: "Regulations" },
  { id: 181, question: "Which command displays both configured DNS server information and the IP address resolution for a URL? (v2)", options: ["Traceroute", "Nmap", "Ping", "Nslookup"], answer: 3, category: "Network Commands" },
  { id: 182, question: "You are working with the senior admin team to identify potential risks. Which phase of risk management are you in? (v2)", options: ["Risk Assessment", "Risk Identification", "Risk Monitoring", "Risk Mitigation"], answer: 1, category: "Risk Management" },
  { id: 183, question: "What protects the personal information of members of the European Union? (v2)", options: ["HIPAA", "PCI DSS", "GDPR", "FERPA"], answer: 2, category: "Regulations" },
  { id: 184, question: "Which security mechanism ensures that data cannot be modified or altered during transmission? (v2)", options: ["Access control", "Two-factor authentication", "Hashing", "Encryption"], answer: 2, category: "Security Mechanisms" },
  { id: 185, question: "What protects the educational records of individuals? (v2)", options: ["FERPA", "PCI DSS", "GDPR", "HIPAA"], answer: 0, category: "Regulations" },
  { id: 186, question: "You recommend purchasing insurance and hiring another organization to maintain the web server. Which risk mitigation strategy is this? (v2)", options: ["Risk Acceptance", "Risk Reduction", "Risk Transfer", "Risk Avoidance"], answer: 2, category: "Risk Management" },
  { id: 187, question: "What protects the credit card information of individuals? (v2)", options: ["FERPA", "PCI DSS", "HIPAA", "GDPR"], answer: 1, category: "Regulations" },

  // ── MATCH: CIA TRIAD DEFINITIONS ─────────────────────────────────────────
  { id: 200, question: "[MATCH] 'Data should never be altered or compromised.' — Which CIA Triad component does this describe?", options: ["Confidentiality", "Availability", "Integrity", "Authentication"], answer: 2, category: "CIA Triad" },
  { id: 201, question: "[MATCH] 'Data should be accessed and read by authorized users only.' — Which CIA Triad component does this describe?", options: ["Integrity", "Availability", "Authentication", "Confidentiality"], answer: 3, category: "CIA Triad" },
  { id: 202, question: "[MATCH] 'Ensuring that data is accessible to users when needed.' — Which CIA Triad component does this describe?", options: ["Confidentiality", "Integrity", "Availability", "Authorization"], answer: 2, category: "CIA Triad" },

  // ── MATCH: WORM RESPONSE ACTIONS ─────────────────────────────────────────
  { id: 203, question: "[MATCH] 'Cleans and patches infected systems.' — Which worm response action is this?", options: ["Quarantine", "Containment", "Inoculation", "Treatment"], answer: 3, category: "Incident Response" },
  { id: 204, question: "[MATCH] 'Removing or blocking infected systems from the network.' — Which worm response action is this?", options: ["Treatment", "Inoculation", "Quarantine", "Containment"], answer: 2, category: "Incident Response" },
  { id: 205, question: "[MATCH] 'Patching uninfected systems to deprive the worm of more available targets.' — Which worm response action is this?", options: ["Treatment", "Quarantine", "Containment", "Inoculation"], answer: 3, category: "Incident Response" },
  { id: 206, question: "[MATCH] 'Compartmentalizing and segmenting the network to limit the spread of a worm to areas already infected.' — Which worm response action is this?", options: ["Treatment", "Quarantine", "Containment", "Inoculation"], answer: 2, category: "Incident Response" },

  // ── MATCH: REGULATIONS ───────────────────────────────────────────────────
  { id: 207, question: "[MATCH] 'Protects information about individuals that are stored by federal agencies.' — Which regulation/act is this?", options: ["HIPAA", "FERPA", "PCI DSS", "FISMA (Federal Information Security Management Act)"], answer: 3, category: "Regulations" },

  // ── MATCH: SECURITY CONTROL TYPES ───────────────────────────────────────
  { id: 208, question: "[MATCH] 'Discovers unwanted events.' — What type of security measure is this?", options: ["Preventive Measures", "Corrective Measures", "Detective Measures", "Deterrent Measures"], answer: 2, category: "Security Management" },
  { id: 209, question: "[MATCH] 'Averts the occurrence of an event.' — What type of security measure is this?", options: ["Detective Measures", "Corrective Measures", "Deterrent Measures", "Preventive Measures"], answer: 3, category: "Security Management" },
  { id: 210, question: "[MATCH] 'Restores a system after an event.' — What type of security measure is this?", options: ["Preventive Measures", "Corrective Measures", "Detective Measures", "Deterrent Measures"], answer: 1, category: "Security Management" },

  // ── MATCH: LOG TYPES ─────────────────────────────────────────────────────
  { id: 211, question: "[MATCH] 'Contains events received from programs running on the device.' — Which Windows log type is this?", options: ["Setup Logs", "System Logs", "Security Logs", "Application Logs"], answer: 3, category: "Security Tools" },
  { id: 212, question: "[MATCH] 'Records information about software installation and operating system updates.' — Which Windows log type is this?", options: ["Application Logs", "Security Logs", "System Logs", "Setup Logs"], answer: 3, category: "Security Tools" },
  { id: 213, question: "[MATCH] 'Lists events generated by the operation of hardware, drivers, and processes.' — Which Windows log type is this?", options: ["Application Logs", "Setup Logs", "System Logs", "Security Logs"], answer: 2, category: "Security Tools" },
  { id: 214, question: "[MATCH] 'Records the success or failure of audit policy events.' — Which Windows log type is this?", options: ["Application Logs", "Setup Logs", "System Logs", "Security Logs"], answer: 3, category: "Security Tools" },

  // ── MATCH: SECURITY TERMS ─────────────────────────────────────────────────
  { id: 215, question: "[MATCH] 'People, Property, or Data' — Which cybersecurity term does this define?", options: ["Threat", "Risk", "Vulnerability", "Asset"], answer: 3, category: "Security Management" },
  { id: 216, question: "[MATCH] 'An action that causes a negative impact.' — Which cybersecurity term does this define?", options: ["Risk", "Vulnerability", "Asset", "Threat"], answer: 3, category: "Security Management" },
  { id: 217, question: "[MATCH] 'The potential for loss, damage, or destruction.' — Which cybersecurity term does this define?", options: ["Threat", "Asset", "Vulnerability", "Risk"], answer: 3, category: "Security Management" },
  { id: 218, question: "[MATCH] 'A weakness that potentially exposes organizations to cyberattacks.' — Which cybersecurity term does this define?", options: ["Threat", "Risk", "Asset", "Vulnerability"], answer: 3, category: "Security Management" },

  // ── MATCH: INCIDENT RESPONSE PHASES ──────────────────────────────────────
  { id: 219, question: "[MATCH] 'Mitigates the impact of the incident.' — Which incident response phase is this?", options: ["Preparation", "Detection Analysis", "Post-incident Activity", "Containment, Eradication, and Recovery"], answer: 3, category: "Incident Response" },
  { id: 220, question: "[MATCH] 'Reports the case and cost of the incident and the steps to prevent future incidents.' — Which incident response phase is this?", options: ["Preparation", "Containment, Eradication, and Recovery", "Detection Analysis", "Post-incident Activity and Preparation"], answer: 3, category: "Incident Response" },
  { id: 221, question: "[MATCH] 'Evaluates incident indicators to determine whether they are legitimate attacks and alerts the organization.' — Which incident response phase is this?", options: ["Preparation", "Post-incident Activity", "Containment, Eradication, and Recovery", "Detection Analysis"], answer: 3, category: "Incident Response" },
  { id: 222, question: "[MATCH] 'Establishes an incident response capability to ensure that organizational assets are sufficiently secure.' — Which incident response phase is this?", options: ["Detection Analysis", "Post-incident Activity", "Containment, Eradication, and Recovery", "Preparation"], answer: 3, category: "Incident Response" },

  // ── MATCH: VULNERABILITY MANAGEMENT TOOLS ────────────────────────────────
  { id: 223, question: "[MATCH] 'Nessus Scanner / CVSS (Common Vulnerability Scoring System)' — Which vulnerability management step does this tool support?", options: ["Prioritizing", "Remediating", "Discovering", "Reporting"], answer: 2, category: "Security Tools" },
  { id: 224, question: "[MATCH] 'NMap' — Which vulnerability management step does this tool support?", options: ["Remediating", "Discovering", "Reporting", "Prioritizing"], answer: 3, category: "Security Tools" },
  { id: 225, question: "[MATCH] 'Patch Management Software / Windows Auto Update and Patch' — Which vulnerability management step does this tool support?", options: ["Discovering", "Prioritizing", "Reporting", "Remediating"], answer: 3, category: "Security Tools" },

  // ── MATCH: DHCP / DNS ATTACKS ─────────────────────────────────────────────
  { id: 226, question: "[MATCH] 'Threat actors configure a fake DHCP server on the network to issue DHCP addresses to clients.' — Which attack is this?", options: ["DHCP Starvation Attack", "DNS Spoofing Attack", "DNS Amplification Attack", "DHCP Rogue Attack"], answer: 3, category: "Cybersecurity Threats" },
  { id: 227, question: "[MATCH] 'Threat actors flood the DHCP server with DHCP requests to use up all available IP addresses that the legitimate DHCP server can issue.' — Which attack is this?", options: ["DHCP Rogue Attack", "DNS Amplification Attack", "DHCP Starvation Attack", "DNS Spoofing Attack"], answer: 2, category: "Cybersecurity Threats" },
  { id: 228, question: "[MATCH] 'Threat actors use publicly accessible open DNS servers to flood a target with DNS response traffic.' — Which attack is this?", options: ["DHCP Rogue Attack", "DNS Spoofing Attack", "DHCP Starvation Attack", "DNS Amplification Attack"], answer: 3, category: "Cybersecurity Threats" },
  { id: 229, question: "[MATCH] 'Threat actors change the A record for your domain's IP address to point to a predetermined address of their choice.' — Which attack is this?", options: ["DHCP Rogue Attack", "DNS Amplification Attack", "DHCP Starvation Attack", "DNS Spoofing Attack"], answer: 3, category: "Cybersecurity Threats" },

  // ── MATCH: SOCIAL ENGINEERING / PHISHING TYPES ───────────────────────────
  { id: 230, question: "[MATCH] 'Threat actors send emails randomly to a very large number of recipients with the intent to gather information for fraud or identity theft.' — Which attack is this?", options: ["Spear Phishing", "Smishing", "Vishing", "Phishing"], answer: 3, category: "Cybersecurity Threats" },
  { id: 231, question: "[MATCH] 'Threat actors send emails carefully designed to get a single recipient within an organization to unknowingly install malware.' — Which attack is this?", options: ["Phishing", "Smishing", "Vishing", "Spear Phishing"], answer: 3, category: "Cybersecurity Threats" },
  { id: 232, question: "[MATCH] 'Threat actors create fraudulent text messages to try to lure victims into revealing account information or installing malware.' — Which attack is this?", options: ["Phishing", "Spear Phishing", "Vishing", "Smishing"], answer: 3, category: "Cybersecurity Threats" },
  { id: 233, question: "[MATCH] 'Threat actors use voice calls to manipulate an individual into releasing confidential data.' — Which attack is this?", options: ["Phishing", "Spear Phishing", "Smishing", "Vishing"], answer: 3, category: "Cybersecurity Threats" },

  // ── MATCH: SYSLOG SEVERITY LEVELS ────────────────────────────────────────
  { id: 234, question: "[MATCH] 'The condition should be corrected immediately.' — Which syslog severity level is this?", options: ["Level 4 (Warning)", "Level 5 (Notice)", "Level 6 (Informational)", "Level 1 (Alert)"], answer: 3, category: "Security Tools" },
  { id: 235, question: "[MATCH] 'An error may occur if the situation is not remedied.' — Which syslog severity level is this?", options: ["Level 1 (Alert)", "Level 5 (Notice)", "Level 6 (Informational)", "Level 4 (Warning)"], answer: 3, category: "Security Tools" },
  { id: 236, question: "[MATCH] 'Unusual event but not an error.' — Which syslog severity level is this?", options: ["Level 1 (Alert)", "Level 4 (Warning)", "Level 6 (Informational)", "Level 5 (Notice)"], answer: 3, category: "Security Tools" },
  { id: 237, question: "[MATCH] 'Normal operation. The situation requires no intervention.' — Which syslog severity level is this?", options: ["Level 1 (Alert)", "Level 4 (Warning)", "Level 5 (Notice)", "Level 6 (Informational)"], answer: 3, category: "Security Tools" },

  // ── MATCH: DMZ PLACEMENT ─────────────────────────────────────────────────
  { id: 238, question: "[MATCH] Is an Email server typically located in a company's DMZ (Demilitarized Zone)?", options: ["No, email servers are always internal", "No, email servers are in the cloud only", "No, email servers do not need external access", "Yes, email servers are typically in the DMZ"], answer: 3, category: "Network Security" },
  { id: 239, question: "[MATCH] Is a Web server typically located in a company's DMZ (Demilitarized Zone)?", options: ["No, web servers are always internal", "No, web servers are behind the internal firewall", "No, web servers are only in the cloud", "Yes, web servers are typically in the DMZ"], answer: 3, category: "Network Security" },
  { id: 240, question: "[MATCH] Is a Directory server (e.g., Active Directory) typically located in a company's DMZ?", options: ["Yes, directory servers are exposed to the public", "Yes, directory servers need external access", "Yes, directory servers are always in the DMZ", "No, directory servers are kept in the internal network"], answer: 3, category: "Network Security" },
  { id: 241, question: "[MATCH] Is a Print server typically located in a company's DMZ?", options: ["Yes, print servers need to be in the DMZ", "Yes, print servers are public-facing", "Yes, print servers require external access", "No, print servers are kept in the internal network"], answer: 3, category: "Network Security" },

  // ── MATCH: SECURITY TOOLS TRUE/FALSE ─────────────────────────────────────
  { id: 242, question: "[MATCH] True or False: 'Zenmap is a GUI application that runs Nmap.'", options: ["False — Zenmap is a standalone scanner", "False — Zenmap replaces Nmap entirely", "False — Zenmap only works on Linux", "True — Zenmap is the official GUI for Nmap"], answer: 3, category: "Security Tools" },
  { id: 243, question: "[MATCH] True or False: 'ss (socket statistics) is the Linux equivalent of netstat.'", options: ["False — ss is a Windows-only tool", "False — ss is used for DNS lookups", "False — ss is part of the Nmap suite", "True — ss is the modern Linux replacement for netstat"], answer: 3, category: "Security Tools" },
  { id: 244, question: "[MATCH] True or False: 'netstat runs in a GUI environment.'", options: ["True — netstat has a built-in GUI", "True — netstat opens a graphical window", "True — netstat requires a desktop environment", "False — netstat is a command-line tool"], answer: 3, category: "Security Tools" },
  { id: 245, question: "[MATCH] True or False: 'netstat shows active and waiting ports for connections.'", options: ["False — netstat only shows closed ports", "False — netstat only displays IP addresses", "False — netstat cannot display port states", "True — netstat displays both active and waiting connection ports"], answer: 3, category: "Security Tools" },

  // ── MATCH: DISASTER COUNTERMEASURES ──────────────────────────────────────
  { id: 246, question: "[MATCH] 'Hardened facilities and alternate sites.' — What type of threat do these countermeasures address?", options: ["Cyberattacks", "Supply-Chain Disruptions", "Employee Errors", "Natural Disasters"], answer: 3, category: "Security Management" },
  { id: 247, question: "[MATCH] 'Firewalls, IDS and IPS, and Log Analyzers.' — What type of threat do these countermeasures address?", options: ["Natural Disasters", "Supply-Chain Disruptions", "Employee Errors", "Cyberattacks"], answer: 3, category: "Network Security" },
  { id: 248, question: "[MATCH] 'Alternate sources and inventory management.' — What type of threat do these countermeasures address?", options: ["Natural Disasters", "Cyberattacks", "Employee Errors", "Supply-Chain Disruptions"], answer: 3, category: "Security Management" },
  { id: 249, question: "[MATCH] 'Standard procedures and training.' — What type of threat do these countermeasures address?", options: ["Natural Disasters", "Cyberattacks", "Supply-Chain Disruptions", "Employee Errors"], answer: 3, category: "Security Management" },

  // ── MATCH: NETWORK MONITORING TOOLS ──────────────────────────────────────
  { id: 250, question: "[MATCH] 'Detects network connections, routing tables, interface statistics, masquerade connections, and multicast membership.' — Which tool does this describe?", options: ["NMap", "nslookup", "Wireshark", "netstat"], answer: 3, category: "Network Commands" },
  { id: 251, question: "[MATCH] 'Scans networks for open ports, service versions, and operating system information.' — Which tool does this describe?", options: ["netstat", "nslookup", "Wireshark", "NMap"], answer: 3, category: "Network Commands" },
  { id: 252, question: "[MATCH] 'Performs DNS queries to obtain domain name or IP address mapping information.' — Which tool does this describe?", options: ["netstat", "NMap", "Wireshark", "nslookup"], answer: 3, category: "Network Commands" },

  // ── MATCH: BACKUP RECOVERY ────────────────────────────────────────────────
  { id: 253, question: "[MATCH] A company uses a full backup every Sunday at 6:00 PM and an incremental backup every other day at 6:00 PM. A user accidentally deleted documents at 8:00 AM on Friday. It is now Saturday 10:00 PM. To recover the most recent version with the fewest backups, which set of backups should you restore?", options: ["Sunday full + Monday + Tuesday + Wednesday incremental backups", "Only the most recent Sunday full backup", "Only Friday's incremental backup", "Sunday full + Monday + Tuesday + Wednesday + Thursday + Friday incremental backups"], answer: 3, category: "Security Management" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "CIA Triad": "#22d3ee",
  "Regulations": "#a78bfa",
  "Network Commands": "#34d399",
  "Networking": "#60a5fa",
  "Network Topologies": "#f472b6",
  "IP Addressing": "#fb923c",
  "Security Mechanisms": "#facc15",
  "Risk Management": "#4ade80",
  "Cybersecurity Threats": "#f87171",
  "Network Security": "#38bdf8",
  "Authentication": "#c084fc",
  "Incident Response": "#ff6b6b",
  "Security Management": "#86efac",
  "Security Tools": "#fda4af",
  "Security Analysis": "#93c5fd",
  "Virtualization": "#d9f99d",
};


const TOTAL = 100;
const LABELS = ["A", "B", "C", "D"] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(): Question[] {
  return shuffle(QUESTIONS).slice(0, TOTAL);
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// ─── START ───────────────────────────────────────────────────────────────────
function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-xl">
        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader className="items-center text-center">
            <div className="mb-2 inline-flex size-12 items-center justify-center rounded-2xl border bg-muted text-xl">
              🛡️
            </div>
            <CardTitle className="text-2xl tracking-tight">ITS Reviewer</CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.2em]">IT23 · Cybersecurity &amp; Networking</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "📋", val: "100", sub: "Questions" },
            { icon: "🔀", val: "Random", sub: "Every run" },
            { icon: "⏱", val: "Timed", sub: "Live clock" },
          ].map((s) => (
              <Card key={s.sub} size="sm" className="items-center border-border/60 bg-muted/30 py-2 text-center">
                <CardContent className="space-y-1 px-2">
                  <div className="text-base">{s.icon}</div>
                  <p className="text-xs font-semibold text-foreground">{s.val}</p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </CardContent>
              </Card>
          ))}
            </div>

            <Card size="sm" className="border-border/60 bg-muted/20">
              <CardContent className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(CATEGORY_COLORS).map(([cat]) => (
                    <Badge key={cat} variant="outline" className="text-[10px] font-medium">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={onStart} size="lg" className="w-full text-sm tracking-wide">
              Begin Quiz
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {TOTAL} questions drawn from {QUESTIONS.length} items
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── QUIZ ────────────────────────────────────────────────────────────────────
function QuizScreen({ questions, onFinish }: QuizScreenProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const q = questions[current];
  const progress = (current / TOTAL) * 100;
  const accent = CATEGORY_COLORS[q.category] || "#60a5fa";
  const isMatch = q.question.startsWith("[MATCH]");
  const displayQ = isMatch ? q.question.replace("[MATCH] ", "") : q.question;
  const score = answers.filter((a) => a.selected === a.correct).length;

  const confirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    setAnswers((p) => [...p, { questionIndex: current, selected, correct: q.answer }]);
  };

  const next = () => {
    if (current + 1 >= TOTAL) {
      onFinish(answers, elapsed);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setConfirmed(false);
  };

  const optionClass = (i: number) => {
    if (!confirmed) {
      return selected === i
        ? "border-primary bg-primary/20 text-primary ring-2 ring-primary/40"
        : "border-border bg-card text-foreground hover:bg-muted";
    }
    if (i === q.answer) return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    if (i === selected) return "border-destructive/50 bg-destructive/10 text-destructive";
    return "border-border/70 bg-card/40 text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4">
          <span className="font-mono text-xs text-muted-foreground">{formatTime(elapsed)}</span>
          <div className="flex flex-1 items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{current + 1}</span>
            <Progress value={progress} className="h-1.5" />
            <span className="font-mono text-xs text-muted-foreground">{TOTAL}</span>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {score}/{current}
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl justify-center px-4 py-6 md:py-8">
        <Card className="w-full border-border/70 bg-card/90">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" style={{ borderColor: accent, color: accent }}>
                {q.category}
              </Badge>
              {isMatch && <Badge variant="secondary">Match</Badge>}
            </div>
            <CardTitle className="text-base leading-relaxed md:text-lg">{displayQ}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {q.options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                className={cn("h-auto w-full justify-start gap-3 px-4 py-3 text-left whitespace-normal", optionClass(i))}
                aria-pressed={selected === i}
                onClick={() => {
                  if (!confirmed) setSelected(i);
                }}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold",
                    selected === i && !confirmed
                      ? "border-primary/70 bg-primary/25 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {LABELS[i]}
                </span>
                <span className="flex-1 text-sm leading-relaxed">{opt}</span>
                {!confirmed && selected === i && (
                  <span className="rounded-md border border-primary/40 bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Selected
                  </span>
                )}
                {confirmed && i === q.answer && <span className="text-sm font-semibold">OK</span>}
                {confirmed && i === selected && selected !== q.answer && <span className="text-sm font-semibold">X</span>}
              </Button>
            ))}

            {confirmed && (
              <Card
                size="sm"
                className={cn(
                  "border px-1",
                  selected === q.answer
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-destructive/40 bg-destructive/10"
                )}
              >
                <CardContent className="text-sm">
                  {selected === q.answer ? "Correct." : `Correct answer: ${q.options[q.answer]}`}
                </CardContent>
              </Card>
            )}

            <Separator />

            {!confirmed ? (
              <Button onClick={confirm} disabled={selected === null} size="lg" className="w-full">
                Confirm
              </Button>
            ) : (
              <Button onClick={next} size="lg" className="w-full">
                {current + 1 >= TOTAL ? "See Results" : "Next"}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
function ResultScreen({ questions, answers, elapsed, onRestart }: ResultScreenProps) {
  const [tab, setTab] = useState<"overview" | "review">("overview");

  const score = answers.filter((a) => a.selected === a.correct).length;
  const pct = Math.round((score / TOTAL) * 100);

  const grade =
    pct >= 90 ? { label: "Excellent", tone: "text-emerald-600 dark:text-emerald-400" }
    : pct >= 80 ? { label: "Great", tone: "text-primary" }
    : pct >= 70 ? { label: "Good", tone: "text-amber-600 dark:text-amber-400" }
    : pct >= 60 ? { label: "Passing", tone: "text-orange-600 dark:text-orange-400" }
    : { label: "Needs Work", tone: "text-destructive" };

  const catStats: Record<string, { total: number; correct: number }> = {};
  answers.forEach((a) => {
    const cat = questions[a.questionIndex].category;
    if (!catStats[cat]) catStats[cat] = { total: 0, correct: 0 };
    catStats[cat].total++;
    if (a.selected === a.correct) catStats[cat].correct++;
  });

  const wrongAnswers = answers.filter((a) => a.selected !== a.correct);

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Card className="border-border/70 bg-card/90 text-center">
          <CardHeader className="space-y-2">
            <CardDescription className="text-[10px] uppercase tracking-[0.2em]">Results</CardDescription>
            <CardTitle className={cn("text-5xl tracking-tighter", grade.tone)}>{pct}%</CardTitle>
            <p className={cn("text-sm font-medium", grade.tone)}>{grade.label}</p>
            <p className="text-xs text-muted-foreground">
              {score} of {TOTAL} correct · {formatTime(elapsed)}
            </p>
          </CardHeader>
        </Card>

        <Tabs value={tab} onValueChange={(value) => setTab(value as "overview" | "review")} className="w-full">
          <TabsList className="grid h-9 w-full grid-cols-2">
            <TabsTrigger value="overview">By Category</TabsTrigger>
            <TabsTrigger value="review">Wrong Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3 space-y-2">
            {Object.entries(catStats).map(([cat, s]) => {
              const p = Math.round((s.correct / s.total) * 100);
              return (
                <Card key={cat} size="sm" className="border-border/70 bg-card/70">
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s.correct}/{s.total}
                      </span>
                    </div>
                    <Progress value={p} className="h-1.5" />
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="review" className="mt-3 space-y-2">
            {wrongAnswers.length === 0 ? (
              <Card className="border-border/70 bg-card/70 py-6 text-center">
                <CardContent className="text-sm text-muted-foreground">Perfect score. No wrong answers.</CardContent>
              </Card>
            ) : (
              wrongAnswers.map((a, idx) => {
                const q = questions[a.questionIndex];
                return (
                  <Card key={idx} size="sm" className="border-border/70 bg-card/70">
                    <CardContent className="space-y-2">
                      <p className="text-sm leading-relaxed text-foreground/90">{q.question.replace("[MATCH] ", "")}</p>
                      <p className="text-xs text-destructive">Your answer: {q.options[a.selected]}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Correct: {q.options[a.correct]}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        <Button onClick={onRestart} variant="outline" size="lg" className="w-full">
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<"start" | "quiz" | "result">("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<AnswerRecord[]>([]);
  const [finalElapsed, setFinalElapsed] = useState(0);

  const handleStart = useCallback(() => {
    setQuestions(pickQuestions());
    setScreen("quiz");
  }, []);

  const handleFinish = useCallback((ans: AnswerRecord[], elapsed: number) => {
    setFinalAnswers(ans);
    setFinalElapsed(elapsed);
    setScreen("result");
  }, []);

  const handleRestart = useCallback(() => setScreen("start"), []);

  if (screen === "start") return <StartScreen onStart={handleStart} />;
  if (screen === "quiz")  return <QuizScreen questions={questions} onFinish={handleFinish} />;
  return <ResultScreen questions={questions} answers={finalAnswers} elapsed={finalElapsed} onRestart={handleRestart} />;
}

