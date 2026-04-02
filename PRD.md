# Blackbox PRD

## 1. Overview

**Blackbox** is a portable, self-hosted off-grid node for communication, local computing, and value transfer in environments where the internet is unavailable, censored, or degraded.

It combines several critical layers in one local node:
- mesh communication over LoRa / Meshtastic
- local services and interfaces accessible over Wi-Fi / LAN
- offline-first mapping and data exchange
- local AI / LLM without cloud dependency
- eCash / Bitcoin-denominated value transfer without direct internet reliance at the local transport layer

Blackbox is not designed as a new radio protocol. It is a **service layer for disconnected environments** - a node that makes mesh networks and local devices useful for real-world tasks such as coordination, messaging, local knowledge access, and off-grid value transfer.

## 2. Problem

Modern communication and digital services depend heavily on centralized internet infrastructure, cloud platforms, and external service providers. In crisis, remote, or censored environments, this creates several immediate problems:

- when the internet goes down, users lose access to communication, knowledge, and digital tools
- mesh devices on their own often provide only low-level transport, not a complete user-facing service layer
- local communities, volunteer groups, field teams, and independent operators lack simple infrastructure for autonomous coordination
- digital value transfer usually assumes constant internet access
- cloud AI and centralized platforms do not work where connectivity is unstable, unavailable, or undesirable for privacy reasons

The result is that even when people have radios, laptops, phones, and local networks, they often still do not have a complete system that allows them to operate autonomously.

## 3. Vision

Blackbox is intended to become a foundational autonomous digital node for disconnected operations.

It is infrastructure that can be deployed:
- in cities during blackouts or network shutdowns
- in rural or remote areas without stable internet
- in field conditions for team coordination
- in communities that need censorship resistance, privacy, and local control over data
- in educational, humanitarian, and resilience-oriented contexts

The long-term vision is a network of Blackbox nodes that can operate locally, interconnect through mesh, bridge across multiple transport layers, and gradually form a **resilient, censorship-resistant off-grid internet layer**.

## 4. Product Goals

### Primary goals
1. Give users an autonomous communication and services node that works without the cloud.
2. Make mesh networks useful not only for text messaging, but for practical real-world workflows.
3. Enable local transfer of value and data in internet-denied environments.
4. Reduce dependence on centralized platforms and external infrastructure.
5. Build a modular system that can scale from a single node to intercity network topologies.

### Non-goals at the current stage
- replacing the global internet in all scenarios
- competing with conventional broadband on bandwidth
- building a new physical radio stack from scratch
- depending on datacenters or SaaS as a requirement for core functionality

## 5. Users

### Primary users
- mesh / LoRa communities
- resilience and preparedness communities
- technical operators of autonomous local networks
- volunteer and humanitarian groups
- field teams / NGO / emergency-adjacent use cases
- privacy-focused and cypherpunk communities

### Secondary users
- researchers working on decentralized and off-grid infrastructure
- local-first AI enthusiasts
- educational initiatives in low-connectivity environments
- communities in censorship-prone regions

## 6. Core Use Cases

### 6.1 Off-grid messaging
Users exchange messages within a city or local region through mesh infrastructure without relying on the internet.

### 6.2 Local knowledge access
Blackbox serves local interfaces, reference material, documentation, instructions, educational content, medical knowledge, and local AI tools over a local network.

### 6.3 Local AI assistance
Users can run a local LLM for analysis, data navigation, documentation support, field instructions, and other tasks without cloud dependency.

### 6.4 Value transfer without conventional internet dependency
Users can send Sats / eCash to each other over local radio transport inside a city or another constrained coverage area.

### 6.5 Mapping and situational coordination
The node supports offline-first mapping and exchange of cartographic / tactical objects for real-world coordination.

### 6.6 Community node deployment
Communities and independent operators can deploy their own nodes and gradually build resilient autonomous infrastructure from them.

## 7. Current Product State

Blackbox already exists as a **working prototype**, not just a concept.

Implemented or working components include:
- Meshtastic integration as the current primary transport
- local message transfer over mesh
- eCash / value packet transport over the existing text channel using chunking
- a local node acting as a service layer on top of mesh rather than just a radio device
- aggregation of node telemetry and related data
- core offline-first interaction logic
- local AI scenarios without mandatory cloud usage
- an open repository and public-facing project direction

Blackbox already demonstrates that off-grid value transfer and local services over mesh are not theoretical - they are part of a functioning stack.

## 8. Key Product Principles

### 8.1 Local-first
If a task can be completed locally, it should be completed locally.

### 8.2 Modularity
Blackbox components should remain replaceable: transport, UI, AI modules, mapping, and payment layer.

### 8.3 Minimal external dependencies
The system should remain useful even under complete absence of external network access.

### 8.4 Resilience over complexity
In critical environments, reliability and predictability matter more than feature excess.

### 8.5 Interoperability
Blackbox should integrate where possible with open ecosystems such as Meshtastic, ATAK/TAK-style workflows, Cashu, local network tools, and future transport layers.

## 9. Technical Approach

Blackbox is structured as a local node with multiple layers:

### Transport layer
- Meshtastic / LoRa as the current primary transport
- future support for new generations of LoRa chips with significantly higher data throughput
- potential support for other transport layers suitable for off-grid deployment

### Service layer
- a local backend that receives, aggregates, processes, and routes data
- interfaces for messaging, telemetry, object exchange, and value packet handling
- API / middleware for extending node logic

### Access layer
- access from laptop, phone, or local Wi-Fi / LAN
- local UI without mandatory cloud backend

### Intelligence layer
- local LLM / AI modules for analysis, retrieval, and assistance
- strictly as a local option, not a cloud dependency

### Value transfer layer
- privacy-preserving eCash / Cashu-like mechanisms
- transport of value packets over available local transport
- when internet is available, optional sync / reissue / mint interaction
- when internet is unavailable, preservation of local transport logic for value-bearing payloads

## 10. Roadmap Options Under Consideration

Blackbox can evolve in several directions. These are not mutually exclusive, but they require different prioritization.

### Option A - Reliable city-scale off-grid node
Focus on stability, usability, and practical operation within a city:
- better message delivery reliability
- better UX for local users
- clearer deployment flow
- more robust Meshtastic integration
- stronger telemetry and observability
- simpler community node kit setup

This is the most pragmatic path for adoption.

### Option B - Off-grid value transfer infrastructure
Focus on moving Sats / eCash:
- better money transfer UX
- delivery error handling and retransmission logic
- confirmation and transfer status tracking
- tighter integration with mint workflows
- demonstration of real peer-to-peer urban use cases

This makes Blackbox uniquely compelling as infrastructure for offline value movement.

### Option C - Local AI + knowledge node
Focus on local AI and knowledge access:
- local knowledge bases
- AI-assisted retrieval
- educational, technical, and medical content bundles
- deployment modes for low-connectivity communities

This increases the usefulness of the node even where payments are not the primary use case.

### Option D - Mapping and coordination stack
Focus on situational awareness:
- better offline maps
- object sharing
- TAK-like workflows
- volunteer / field coordination use cases

This strengthens the fit for NGOs, emergency-adjacent actors, and field teams.

### Option E - Intercity network architecture
Focus on next-generation network design:
- designing intercity topologies
- using new LoRa chip generations with higher throughput
- multi-hop and gateway architectures
- bridge nodes between districts and cities
- practical exploration of a censorship-resistant regional network model

This is the most ambitious direction and potentially the strongest for narrative and funding.

## 11. Recommended Near-Term Priorities

The most rational near-term priorities are:
1. Establish Blackbox as a reliable **city-scale working node**
2. Simplify deployment and value transfer demonstration flows
3. Build a clear narrative for grants, pilot programs, and partner conversations
4. Prepare a roadmap around new higher-throughput LoRa generations
5. Begin architecture-level testing for intercity connectivity scenarios
6. Prepare a mobile / client access layer for usage outside a dev-only environment

## 12. Risks and Open Questions

### Technical risks
- current-generation LoRa hardware still limits throughput for larger payloads and richer application workflows
- delivery reliability for long payloads depends on fragmentation, retransmission logic, and radio conditions
- user experience can degrade when transport is slow or packet delivery becomes inconsistent
- some performance constraints are still tied to current hardware capabilities
- weaker devices can face compute limits when messaging, mapping, and local AI are combined

Many of these limitations are transitional rather than fundamental. Upcoming generations of LoRa hardware are expected to significantly increase data throughput, which should allow larger amounts of data to be transmitted faster, more reliably, and with better practical usability for real off-grid applications.

### Product risks
- difficulty of explaining the product clearly to broad audiences
- need to balance simplicity with advanced functionality
- scope expansion without clear prioritization

### Ecosystem risks
- funding may be easier to secure for specific verticals than for the entire stack at once
- some partners will understand AI, some payments, some mesh - the narrative will need adaptation
- adoption requires not only technology, but also community formation

## 13. Why This Matters Now

Blackbox is emerging at a moment when several trends are converging:
- growing interest in local-first and resilient systems
- declining trust in centralized cloud infrastructure
- development of mesh and low-power radio ecosystems
- new generations of LoRa chips with higher throughput
- increasing interest in privacy-preserving digital cash
- rising demand for autonomous systems in crisis, censored, and low-connectivity environments

That makes Blackbox more than an experiment - it is a timely infrastructure bet.

## 14. Funding Thesis

Blackbox is potentially fundable because it sits at the intersection of several important themes:
- internet freedom
- resilient communications
- local-first infrastructure
- offline knowledge access
- privacy-preserving payments
- open-source public-interest technology

The most realistic funding path is not to sell it as "everything at once", but to package it through distinct funding narratives:
- off-grid communication infrastructure
- offline value transfer
- censorship-resistant local knowledge node
- emergency / NGO / resilience tooling
- next-generation community network stack

## 15. One-line Positioning

**Blackbox is a self-hosted off-grid node for communication, local intelligence, mapping, and value transfer in disconnected environments.**