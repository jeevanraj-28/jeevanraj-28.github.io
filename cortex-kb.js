/* ================================================
   CORTEX KNOWLEDGE BASE
   Every fact Cortex can state. Answers are retrieved
   from here (or fetched live from GitHub), never made up.
   Keep in sync with index.html and the profile README.
   ================================================ */

window.CORTEX_KB = {
    owner: {
        name: 'Jeevan Raj M',
        github: 'jeevanraj-28',
        email: 'jeevanrajm2882004@gmail.com',
        linkedin: 'https://linkedin.com/in/jeevan-raj-m-5ba64a383',
        resume: 'Jeevan_Raj_M_AI_ML_Engineer_Resume.pdf'
    },

    // Domains visitors can ask about ("show me your RAG work").
    domains: {
        ai:         { label: 'AI', words: ['ai', 'artificial intelligence'] },
        ml:         { label: 'Machine Learning', words: ['ml', 'machine learning', 'model', 'models'] },
        dl:         { label: 'Deep Learning', words: ['deep learning', 'dl', 'neural', 'pytorch'] },
        ds:         { label: 'Data Science', words: ['data science', 'ds', 'data analysis', 'analytics', 'data scientist'] },
        rag:        { label: 'RAG / Retrieval', words: ['rag', 'retrieval', 'vector', 'faiss', 'embedding', 'embeddings', 'semantic search'] },
        llm:        { label: 'LLMs / GenAI', words: ['llm', 'llms', 'genai', 'generative', 'gen ai', 'language model', 'ollama', 'qwen'] },
        nlp:        { label: 'NLP', words: ['nlp', 'natural language', 'text', 'speech', 'whisper'] },
        cv:         { label: 'Computer Vision', words: ['cv', 'computer vision', 'vision', 'image', 'images', 'segmentation', 'detection'] },
        healthcare: { label: 'Healthcare AI', words: ['healthcare', 'health', 'medical', 'clinical', 'emr', 'hospital'] },
        recsys:     { label: 'Recommender Systems', words: ['recommender', 'recommendation', 'recsys', 'recommend'] },
        mlops:      { label: 'Deployment / MLOps', words: ['mlops', 'deploy', 'deployment', 'docker', 'fastapi', 'api', 'serving', 'production', 'backend'] },
        systems:    { label: 'Systems Tooling', words: ['systems', 'system', 'tooling', 'observability', 'monitoring', 'telemetry'] },
        web:        { label: 'Full-stack / Web', words: ['full stack', 'full-stack', 'fullstack', 'web', 'web app', 'react', 'frontend', 'saas', 'node'] }
    },

    // Projects: alias list is what visitors might type.
    projects: [
        {
            id: 'lumina', hook: 'Local RAG with citations; found and fixed a chunker that dropped ~13% of text', domains: ['rag','llm','nlp','ai','mlops'], repo: 'lumina-rag-assistant', branch: 'master',
            name: 'Lumina RAG Assistant',
            aliases: ['lumina', 'rag assistant', 'lumina rag', 'document qa', 'document q&a'],
            summary: 'Private, local document Q&A with citations. FastAPI, FAISS, local LLMs through Ollama, OCR for scanned PDFs, an OpenAI-compatible API, and Docker.',
            result: 'Built a retrieval evaluation (recall@k, MRR). A coverage test found the chunker silently dropped about 13% of each document; that was fixed and is covered by tests.',
            stack: ['Python', 'FastAPI', 'FAISS', 'Ollama', 'OCR', 'Docker', 'GitHub Actions']
        },
        {
            id: 'clinical', hook: 'Doctor notes to structured fields; F1 0.71 → 0.97 on held-out notes', domains: ['nlp','healthcare','ai','ml','ds'], repo: 'Clinical-NLP-Demo', branch: 'main',
            name: 'Clinical NLP Demo',
            aliases: ['clinical nlp', 'clinical', 'doctor notes', 'medical nlp', 'medication'],
            summary: 'Turns synthetic doctor dictation into structured sections and a medication list, with negation handling and a summary that is checked for invented numbers.',
            result: 'Micro F1 went from 0.71 to 0.97 on 20 held-out labelled notes. Negated findings wrongly listed as complaints dropped from 6 of 9 to 0 of 9.',
            stack: ['Python', 'NLP', 'Hugging Face', 'GitHub Actions']
        },
        {
            id: 'disaster', hook: 'U-Net flood mapping on drone images; 70.7% mIoU on 448 test images', domains: ['cv','dl','ml','ai','ds'], repo: 'Disaster-segmentation', branch: 'main',
            name: 'Disaster Segmentation',
            aliases: ['disaster', 'segmentation', 'floodnet', 'flood', 'u-net', 'unet', 'drone'],
            summary: 'Pixel-level flood damage maps from drone images (FloodNet, 10 classes) using a U-Net with a ResNet34 encoder in PyTorch.',
            result: '70.7% mean IoU on 448 held-out test images. Small objects such as vehicles and pools are the main error source, analysed per class.',
            stack: ['Python', 'PyTorch', 'U-Net', 'ResNet34', 'OpenCV']
        },
        {
            id: 'cafecritic', hook: 'TF-IDF + ratings recommender; data audit ruled out collaborative filtering', domains: ['ds','ml','recsys'], repo: 'cafecritic-recommender', branch: 'main',
            name: 'CafeCritic',
            aliases: ['cafecritic', 'cafe critic', 'cafe', 'recommender', 'recommendation'],
            summary: 'Cafe recommender combining TF-IDF similarity on cafe profiles with ratings, served in Streamlit.',
            result: 'A data audit showed every reviewer had exactly one rating, so collaborative filtering could not work. The system was redesigned around what the data actually supports.',
            stack: ['Python', 'scikit-learn', 'TF-IDF', 'Streamlit']
        },
        {
            id: 'cortex', hook: 'Read-only system observer; every claim linked to raw evidence', domains: ['systems','mlops'], repo: 'cortex', branch: 'main',
            name: 'Cortex System Intelligence',
            aliases: ['cortex system', 'cortex intelligence', 'system observer', 'cortex project', 'cortex repo'],
            summary: 'Local-first, read-only system observer. A daemon records process and system telemetry to SQLite and serves it through a CLI, a loopback REST API and a terminal UI.',
            result: 'Every statement is labelled OBSERVED, CORRELATED or HYPOTHESIS and links back to the raw observation IDs. Commands use a fixed grammar instead of free text, so there is nothing to prompt-inject.',
            stack: ['Python', 'SQLite', 'REST API', 'TUI']
        },
        {
            id: 'care', hook: 'Self-hosted EMR with a Whisper + Qwen2.5 AI Scribe (in progress)', domains: ['healthcare','llm','ai','mlops','nlp'], repo: 'care', branch: 'main',
            name: 'CARE EMR + AI Scribe',
            aliases: ['care', 'emr', 'scribe', 'ai scribe', 'care emr', 'metabase'],
            summary: 'Self-hosted deployment of the open-source CARE EMR (Django, React, PostgreSQL, Redis, Celery) with Metabase analytics and an AI Scribe on a cloud GPU. In progress.',
            result: 'The scribe transcribes speech with Whisper and fills EMR forms with Qwen2.5.',
            stack: ['Django', 'React', 'PostgreSQL', 'Redis', 'Celery', 'Metabase', 'Whisper', 'Qwen2.5']
        },
        {
            id: 'futurepath', hook: 'Aptitude test + explainable career matching + guarded AI mentor', domains: ['ai', 'llm', 'recsys', 'web', 'mlops'], repo: 'futurepathaiv2', branch: 'main',
            name: 'FuturePath AI',
            aliases: ['futurepath', 'future path', 'futurepath ai', 'career guidance', 'career', 'dhruv', 'aptitude', 'edtech'],
            summary: 'Career guidance platform for Indian Class 10 and 12 students, parents and schools. A 40-question test across 16 aptitude dimensions feeds an explainable, deterministic career-matching engine, with 30-day to 1-year roadmaps and an AI mentor.',
            result: 'The mentor uses Gemini or OpenAI with guardrails (no invented cut-offs, cites official bodies) and falls back to a deterministic engine when no API key is set. Parents see reports only after student consent. Covered by unit, component, end-to-end and accessibility tests.',
            stack: ['TypeScript', 'React', 'Node.js', 'Express', 'Prisma', 'SQLite/PostgreSQL', 'Gemini/OpenAI', 'Vitest', 'Playwright']
        }
    ],

    // General facts. `section` = page section to scroll to.
    docs: [
        {
            id: 'about', title: 'Who Jeevan is', section: 'about',
            keywords: 'who jeevan about introduce yourself profile summary background person engineer',
            text: 'Jeevan Raj M is an applied ML / LLM engineer from Mysuru, Karnataka, India. He builds ML systems and measures them: retrieval pipelines scored with recall@k, segmentation models judged on held-out mIoU, and NLP extractors scored against labelled test sets. He cares about finding where a model fails, not just showing where it works.'
        },
        {
            id: 'education', title: 'Education', section: 'about',
            keywords: 'education degree college university school study studied cgpa gpa marks grades graduate graduation btech be bachelor mysore',
            text: 'B.E. in Artificial Intelligence & Data Science at the University of Mysore School of Engineering, 2022–2026, CGPA 9 / 10.'
        },
        {
            id: 'kinetrix', title: 'AI Development Intern, Kinetrix Technologies', section: 'experience',
            keywords: 'experience internship intern job work kinetrix company healthcare whisper bert yolo resnet fastapi oauth2 jwt rbac celery radiology speech',
            text: 'AI Development Intern at Kinetrix Technologies LLP, Oct 2025 – May 2026. Built Hugging Face-based clinical speech-to-text (Whisper, BERT) and radiology image analysis (YOLO, ResNet) modules for CARE, an open-source healthcare platform, behind a FastAPI backend with OAuth2, JWT and RBAC, with inference on Celery workers.'
        },
        {
            id: 'infotact', title: 'Data Science & ML Intern, Infotact Solutions', section: 'experience',
            keywords: 'experience internship intern job work infotact data science ml pandas scikit-learn virtual',
            text: 'Data Science & ML Intern at Infotact Solutions (virtual), Sep 2025 – Nov 2025. Ran end-to-end ML workflows on real datasets (cleaning, feature engineering, training, evaluation) with pandas and scikit-learn, comparing models on held-out metrics.'
        },
        {
            id: 'skills', title: 'Skills', section: 'skills',
            keywords: 'skills stack tech technologies tools languages know frameworks python pytorch sql libraries capabilities',
            text: 'ML and data: Python, PyTorch, scikit-learn, Hugging Face Transformers, pandas, NumPy, OpenCV, SQL.\nLLMs and retrieval: RAG, embeddings, FAISS, chunking, retrieval evaluation (recall@k, MRR), prompt design, Ollama.\nServing and tools: FastAPI, Celery, Docker, Streamlit, PostgreSQL, Git, Linux, GitHub Actions.\nWeb: TypeScript, React, Node.js.'
        },
        {
            id: 'contact', title: 'Contact', section: 'contact',
            keywords: 'contact email mail reach hire hiring message talk connect linkedin phone get in touch',
            text: 'Email: jeevanrajm2882004@gmail.com. LinkedIn: Jeevan Raj M. The fastest route is email.'
        },
        {
            id: 'availability', title: 'Availability', section: 'contact',
            keywords: 'available availability open hire hiring looking job internship role opportunity relocate remote start when',
            text: 'Class of 2026, B.E. in AI & Data Science. Jeevan is looking for AI/ML engineering roles and internships. For specifics (start date, location, remote), email him directly.'
        },
        {
            id: 'location', title: 'Location', section: 'about',
            keywords: 'location where based live city country india mysuru mysore karnataka',
            text: 'Based in Mysuru, Karnataka, India.'
        },
        {
            id: 'rag-exp', title: 'RAG / LLM experience', section: 'projects', projectRef: 'lumina',
            keywords: 'rag llm retrieval embeddings faiss ollama vector search chatbot genai generative ai language model',
            text: 'LLM and retrieval work: Lumina RAG Assistant (local document Q&A with citations, FAISS, Ollama, evaluated with recall@k and MRR) and the CARE AI Scribe (Whisper + Qwen2.5 filling EMR forms).'
        },
        {
            id: 'cv-exp', title: 'Computer vision experience', section: 'projects', projectRef: 'disaster',
            keywords: 'computer vision cv image images segmentation detection yolo resnet opencv pytorch',
            text: 'Computer vision work: Disaster Segmentation (U-Net + ResNet34, 70.7% mIoU on FloodNet drone imagery) and radiology image analysis with YOLO and ResNet during the Kinetrix internship.'
        },
        {
            id: 'nlp-exp', title: 'NLP experience', section: 'projects', projectRef: 'clinical',
            keywords: 'nlp natural language text extraction clinical speech whisper bert transformers',
            text: 'NLP work: Clinical NLP Demo (F1 0.71 → 0.97 on held-out notes), clinical speech-to-text with Whisper and BERT at Kinetrix, and TF-IDF recommendations in CafeCritic.'
        },
        {
            id: 'testing', title: 'How Jeevan validates work', section: 'projects',
            keywords: 'testing tests evaluation evaluate metrics ci github actions quality honest failure',
            text: 'Lumina, Disaster Segmentation, Clinical NLP and CafeCritic run their tests on every push with GitHub Actions. Each README covers setup, results, what failed and what changed.'
        },
        {
            id: 'site', title: 'About Cortex (me)', section: null,
            keywords: 'cortex you robot bot assistant how do you work are you ai llm chatgpt who made you',
            text: 'Cortex. Jeevan\'s portfolio intelligence.\n\nTwo sources: this site, and his public GitHub, read live. Under the hood I am a retrieval engine (BM25 ranking), the same principle as his RAG work, minus the generator. No language model means no guesswork. If it is not on record, I will tell you.'
        }
    ]
};
