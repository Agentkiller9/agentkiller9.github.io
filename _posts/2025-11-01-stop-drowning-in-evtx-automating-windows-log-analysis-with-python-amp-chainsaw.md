---
title: "Stop Drowning in EVTX: Automating Windows Log Analysis with Python &amp; Chainsaw"
author: "Mujtaba Shaikeldin"
date: "2025-11-01 10:56:50"
categories: []
---

As security analysts, we know the drill: an incident hits, and suddenly you’re staring down gigabytes of raw Windows Event Log files (.evtx). Manually sifting through that noise for the few critical **Event IDs** that reveal attacker activity is a nightmare.

That’s why I built the **Chainsaw Automator** — a Python utility designed to weaponize the already powerful Chainsaw executable and turn massive log dumps into clean, actionable intelligence.

### The Problem: Speed vs. Volume

Tools like **Chainsaw** (developed by WithSecure Labs) are excellent for high-speed log carving. They quickly find patterns and TTPs, but the default output is often raw JSON, which is clunky to analyze across dozens of search results.

My goal was simple: **Streamline the process from raw EVTX to a structured CSV report.**

### Inside the Chainsaw Automator

This utility is a classic example of using Python to glue complex security tools together, achieving speed and clarity in forensic investigations.

### 1\. Interactive, Focused Searches

Instead of running a single, massive search, my script allows analysts to focus on what matters most. It provides built-in mappings for high-value security events, allowing for targeted searches against the log repository.

We can ask Chainsaw to specifically look for:

*   **Failed Logons (4625):** Hunting for brute-force attempts.
*   **Successful Network Logons (4624/Logon Type 3):** Tracking initial and lateral access.
*   **Account Creations (4720):** Identifying persistence or privilege escalation.

### 2\. From JSON Chaos to CSV Clarity

The most critical part of the script is the post-processing engine. After Chainsaw dumps the results into individual JSON files for each Event ID, the Python script takes over:

1.  **Iterates** through every raw JSON file.
2.  **Extracts** essential forensic fields (TimeCreated, TargetUserName, IpAddress, LogonType, etc.).
3.  **Translates** numeric codes (like LogonType) into human-readable text (e.g., "NetworkInteractive").
4.  **Consolidates** everything into a single, clean **CSV spreadsheet**.

This final CSV is ready for pivot tables, correlation, or import into any spreadsheet tool — saving hours of manual parsing.

### 3\. Key Data Transformation

A small but powerful feature is the automatic mapping of **Logon Types**. In Windows, a successful logon (Event ID 4624) is nearly useless without knowing the type. The script automatically converts:

![](https://cdn-images-1.medium.com/max/741/1*SMm-6kgb-XTEO9ioZ81C4w.png)

### Conclusion & Next Steps

Automating the Chainsaw workflow allows Blue Team practitioners to spend less time formatting data and more time hunting for the threats embedded within the logs.

This project is a testament to the power of scripting in modern security operations. The full code is available on my GitHub. Feel free to clone the repo, contribute, and enhance your own DFIR toolkit!

_Find the full Chainsaw Automator script and documentation on my_ [_GitHub_](https://github.com/Agentkiller9/Chainsaw-Automator)_._

**#DFIR #ThreatHunting #Python #Cybersecurity #SecOps #BlueTeam**

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=0248cb28fdcb)