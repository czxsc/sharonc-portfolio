
# Artificer
## General Project Overview
Problem: Existing reverse image search can identify famous works, while LLMs can provide general explanations—but neither reliably handles both exact artwork identification and contextual historical understanding. From a systems perspective, the problem combines image understanding, semantic retrieval, and knowledge synthesis into a single pipeline.
## System Design
Diagram of how code works. Uploads image, either exact retrieval for the Artwork specific background if exists. If not, then predicts historical context as much as possible (ex. stylistic period, artist, etc). Synthesizes these with RAG for detailed historical context 

User uploads artwork

        │

Image preprocessing

        │

Vision Encoder

        │

───────────────┐
               │
Artwork Match? │
               │
───────────────┘

     │Yes                 │No

Retrieve metadata     Predict style,
artist, period

        │

Retrieve supporting sources

        │

RAG

        │

Final explanation

## Visual Understanding Pipeline
Dataset: WikiArt vs MET API vs Chicago Art Institute API (Decided on WikiArt)
Initial Dataset Analysis: Cleaning, Normalization, Duplicate Removal (Had issue with unknown artist label dominating dataset)
Feature Extraction: CLIP embeddings allow the system to compare artworks semantically rather than relying on exact pixel similarity, making retrieval robust to different photographs, lighting conditions, and crops.
This is used for classification: Purpose more for generalizing across unseen artworks in dataset

## Retrieval Pipeline
Can we identify the exact artwork? If possible then ideal since theres often specific history surrounding a particular work (Ex. story of mona lisa rather than just talking about da vinci).
Can we identify the exact artwork?
↓
If confidence high
Return metadata.
↓
Otherwise
Retrieve similar artworks.
↓
Infer style
movement
artist
period
↓
Continue.

## Knowledge Synthesis
Structured Context: Museum metadata, Artist info, Year, Medium, Movement
External Knowledge: Search, Wikipedia, Academic Sources, Museum Sources, etc.
LLM/RAG: Synthesizing into detailed historical context

## Engineering Decisions
Why certain model
Why classification vs retrieval vs combined approach
Why RAG/LLM

## Infrastructure & Deployment
Backend: API, Caching
Storage: Images, databse, embeddings, metadata
Performance Optimization
Deployment: Docker, Cloud, Scaling, rate limitations, etc.

## Challenges
Visually similar artworks, confidence, balancing speed and accuracy, avoiding hallucination, different crops/lighting/perspective/rotations, data source cleaning
