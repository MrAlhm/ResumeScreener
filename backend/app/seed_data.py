import os
from sqlalchemy.orm import Session
from app.models.entities import JobDescription, Candidate, Resume, ScreeningSession, MatchResult, RecruiterDecision
from app.scoring.engine import ScoringEngine
from app.scoring.weights import CATEGORY_MAX_POINTS

SAMPLE_JOB_DESCRIPTIONS = [
    {
        "title": "Machine Learning Engineer",
        "company": "NexusAI Technologies",
        "experience_required": 2.0,
        "location": "San Francisco, CA (Hybrid)",
        "salary_range": "$135,000 - $165,000",
        "raw_text": """Machine Learning Engineer
Company: NexusAI Technologies
Location: San Francisco, CA (Hybrid)
Experience Required: 2+ years of professional ML experience

About the Role:
NexusAI is seeking a skilled and proactive Machine Learning Engineer to design, build, and deploy production machine learning models and intelligent data pipelines.

Key Responsibilities:
- Design, develop, train, and fine-tune scalable machine learning and deep learning models.
- Build high-performance REST APIs (using FastAPI/Python) to serve model inference in production.
- Work closely with data engineering teams to optimize feature stores, SQL pipelines, and embeddings.
- Maintain high code quality with automated unit testing, documentation, and continuous integration.

Required Qualifications (Mandatory):
- 2+ years of production experience in Machine Learning or Data Science.
- Strong proficiency in Python and SQL.
- Deep expertise in Deep Learning frameworks (PyTorch or TensorFlow) and Scikit-learn.
- Strong understanding of data structures, algorithms, and modular software engineering.
- Bachelor's or Master's degree in Computer Science, AI, Mathematics, or related field.

Preferred Qualifications (Nice-to-Have):
- Hands-on experience with Docker, Kubernetes, and containerized deployment.
- Experience with Cloud platforms (AWS or GCP).
- Familiarity with MLOps tooling (MLflow, Weights & Biases, or Airflow).
- Experience with Large Language Models (LLMs), RAG architectures, or Hugging Face.
- Excellent cross-functional communication and collaborative problem-solving skills.""",
        "structured_json": {
            "job_title": "Machine Learning Engineer",
            "company": "NexusAI Technologies",
            "required_skills": ["Python", "Machine Learning", "SQL", "PyTorch", "TensorFlow", "Scikit-learn", "Deep Learning"],
            "preferred_skills": ["Docker", "AWS", "Kubernetes", "MLOps", "LLMs", "RAG"],
            "programming_languages": ["Python", "SQL"],
            "frameworks": ["PyTorch", "TensorFlow", "FastAPI", "Scikit-learn"],
            "tools": ["Docker", "AWS", "Git", "Kubernetes"],
            "experience_required": 2.0,
            "education": ["Bachelor's or Master's degree in Computer Science or related field"],
            "responsibilities": [
                "Design, develop, and deploy production machine learning models",
                "Build scalable REST APIs for model inference",
                "Collaborate with engineering teams on data pipelines and embeddings"
            ],
            "domain_knowledge": ["Deep Learning", "Natural Language Processing", "Model Deployment"],
            "soft_skills": ["Communication", "Teamwork", "Problem Solving"],
            "keywords": ["PyTorch", "FastAPI", "SQL", "Deep Learning", "Docker", "AWS"],
            "critical_requirements": ["2+ years ML experience", "Python and SQL proficiency", "PyTorch or TensorFlow"]
        }
    },
    {
        "title": "Senior Full Stack Engineer",
        "company": "CloudScale Systems",
        "experience_required": 3.0,
        "location": "Remote",
        "salary_range": "$140,000 - $175,000",
        "raw_text": """Senior Full Stack Engineer
Company: CloudScale Systems
Experience: 3+ years

Responsibilities:
- Build robust web applications using React, TypeScript, and modern backend services.
- Architect RESTful APIs and microservices using FastAPI/Python or Node.js.
- Optimize database queries in PostgreSQL and manage cloud infrastructure on AWS/Docker.

Required Skills:
- React, TypeScript, Python or Node.js, PostgreSQL, REST APIs, Git.
Preferred: Docker, AWS, Tailwind CSS, Redis.""",
        "structured_json": {
            "job_title": "Senior Full Stack Engineer",
            "company": "CloudScale Systems",
            "required_skills": ["React", "TypeScript", "Python", "Node.js", "PostgreSQL", "REST APIs", "Git"],
            "preferred_skills": ["Docker", "AWS", "Tailwind CSS", "Redis"],
            "programming_languages": ["TypeScript", "JavaScript", "Python", "SQL"],
            "frameworks": ["React", "FastAPI", "Node.js"],
            "tools": ["Docker", "AWS", "Git", "PostgreSQL"],
            "experience_required": 3.0,
            "education": ["Bachelor's in Computer Science"],
            "responsibilities": ["Build web applications", "Architect microservices", "Optimize PostgreSQL"],
            "domain_knowledge": ["Full Stack Web Architecture", "Cloud Infrastructure"],
            "soft_skills": ["Leadership", "Agile Collaboration"],
            "keywords": ["React", "TypeScript", "FastAPI", "PostgreSQL"],
            "critical_requirements": ["3+ years full stack experience", "React + TypeScript proficiency"]
        }
    }
]

SAMPLE_CANDIDATES = [
    {
        "name": "Aarav Sharma",
        "email": "aarav.sharma@example.com",
        "phone": "+1 (415) 555-0182",
        "location": "San Francisco, CA",
        "linkedin": "https://linkedin.com/in/aaravsharma-ml",
        "github": "https://github.com/aaravsharma",
        "current_title": "Lead Machine Learning Engineer",
        "total_experience_years": 5.0,
        "summary": "Accomplished Machine Learning Engineer with 5 years of experience architecting, training, and deploying deep learning systems, RAG pipelines, and high-throughput REST inference APIs.",
        "target_score": 91.5,
        "raw_resume": """Aarav Sharma
San Francisco, CA | aarav.sharma@example.com | +1 (415) 555-0182 | linkedin.com/in/aaravsharma-ml | github.com/aaravsharma

SUMMARY:
Lead Machine Learning Engineer with 5 years of experience building scalable ML and NLP systems in production. Expert in Python, PyTorch, SQL, FastAPI, Docker, and AWS.

EXPERIENCE:
Senior Machine Learning Engineer | DeepVision AI | 2022 - Present
- Architected and trained multi-modal transformer models in PyTorch, reducing inference latency by 42%.
- Built high-throughput asynchronous inference microservices using FastAPI and Docker on AWS ECS.
- Created robust feature engineering pipelines querying multi-terabyte PostgreSQL and Snowflake warehouses.

Machine Learning Engineer | Apex Data Labs | 2020 - 2022
- Developed predictive classification and time-series models with Scikit-learn and TensorFlow.
- Implemented automated CI/CD model evaluation pipelines using Git, Docker, and MLflow.

EDUCATION:
Master of Science in Computer Science (AI Track) | Stanford University | 2018 - 2020 | GPA: 3.9/4.0
Bachelor of Technology in Computer Science | IIT Bombay | 2014 - 2018

SKILLS:
- Programming Languages: Python, SQL, C++, Bash
- Frameworks: PyTorch, TensorFlow, FastAPI, Scikit-learn, HuggingFace Transformers
- Databases: PostgreSQL, Redis, Snowflake
- AI/ML: Deep Learning, NLP, RAG, Computer Vision, Transformers, LLM Fine-tuning
- Tools & Cloud: Docker, Kubernetes, AWS, Git, Linux, CI/CD
- Soft Skills: Technical Leadership, Cross-functional Communication, Mentorship

PROJECTS:
- Enterprise RAG Platform: Built an enterprise retrieval-augmented generation engine using LangChain, PyTorch, and Milvus vector search serving 10,000 daily queries.
- High-Speed Vision Classifier: Deployed quantized ResNet and ViT models on AWS Lambda with sub-50ms p95 latency.""",
        "parsed_json": {
            "candidate": {
                "name": "Aarav Sharma",
                "email": "aarav.sharma@example.com",
                "phone": "+1 (415) 555-0182",
                "location": "San Francisco, CA",
                "linkedin": "https://linkedin.com/in/aaravsharma-ml",
                "github": "https://github.com/aaravsharma",
                "summary": "Lead Machine Learning Engineer with 5 years of experience building scalable ML and NLP systems in production."
            },
            "education": [
                {"institution": "Stanford University", "degree": "M.S.", "field": "Computer Science (AI Track)", "start_year": "2018", "end_year": "2020", "gpa": "3.9/4.0"},
                {"institution": "IIT Bombay", "degree": "B.Tech", "field": "Computer Science", "start_year": "2014", "end_year": "2018", "gpa": "3.85/4.0"}
            ],
            "experience": [
                {
                    "company": "DeepVision AI",
                    "job_title": "Senior Machine Learning Engineer",
                    "start_date": "2022",
                    "end_date": "Present",
                    "description": "Architected multi-modal transformer models in PyTorch.",
                    "technologies": ["Python", "PyTorch", "FastAPI", "Docker", "AWS"],
                    "responsibilities": ["Trained multi-modal transformers", "Built inference APIs", "Created feature pipelines"]
                },
                {
                    "company": "Apex Data Labs",
                    "job_title": "Machine Learning Engineer",
                    "start_date": "2020",
                    "end_date": "2022",
                    "description": "Developed predictive classification models.",
                    "technologies": ["Python", "TensorFlow", "Scikit-learn", "SQL", "MLflow"],
                    "responsibilities": ["Built classification models", "Implemented automated CI/CD"]
                }
            ],
            "skills": {
                "programming_languages": ["Python", "SQL", "C++", "Bash"],
                "frameworks": ["PyTorch", "TensorFlow", "FastAPI", "Scikit-learn", "HuggingFace"],
                "databases": ["PostgreSQL", "Redis", "Snowflake"],
                "ai_ml": ["Deep Learning", "NLP", "RAG", "Transformers", "Machine Learning", "Computer Vision"],
                "tools": ["Docker", "Kubernetes", "AWS", "Git", "Linux", "CI/CD"],
                "soft_skills": ["Leadership", "Communication", "Mentorship", "Problem Solving"]
            },
            "projects": [
                {
                    "name": "Enterprise RAG Platform",
                    "description": "Enterprise retrieval-augmented generation engine serving 10,000 daily queries.",
                    "technologies": ["Python", "PyTorch", "LangChain", "Vector Search"],
                    "responsibilities": "Lead Architect",
                    "outcomes": "Sub-100ms response time with 98% retrieval precision."
                }
            ],
            "certifications": [
                {"name": "AWS Certified Machine Learning - Specialty", "issuer": "Amazon Web Services", "date": "2023"}
            ],
            "total_experience_years": 5.0
        },
        "match_details": {
            "matched_skills": ["Python", "SQL", "PyTorch", "TensorFlow", "Scikit-learn", "Deep Learning", "Machine Learning", "Docker", "AWS"],
            "missing_skills": [],
            "partial_matches": [],
            "strengths": [
                "Exceeds 2+ year requirement with 5 years of verified production ML engineering experience.",
                "Dual mastery in PyTorch and TensorFlow with end-to-end model training and quantization.",
                "Extensive cloud and containerization deployment skills across AWS, Docker, and FastAPI."
            ],
            "gaps": ["No major gaps detected; exceptionally aligned with mandatory and preferred requirements."],
            "critical_gaps": [],
            "justification": "Aarav Sharma is an outstanding match (91/100). He possesses 5 years of verified ML experience, mastery in Python, PyTorch, SQL, and FastAPI, combined with solid AWS/Docker deployment skills and a Stanford MS in AI."
        }
    },
    {
        "name": "Priya Reddy",
        "email": "priya.reddy@example.com",
        "phone": "+1 (408) 555-0143",
        "location": "San Jose, CA",
        "linkedin": "https://linkedin.com/in/priyareddy-dev",
        "github": "https://github.com/priyareddy",
        "current_title": "Senior Backend & ML Infrastructure Engineer",
        "total_experience_years": 4.0,
        "summary": "Senior Software & ML Systems Engineer with 4 years building high-concurrency Python/FastAPI backends, PostgreSQL schemas, and deploying Scikit-learn/PyTorch inference microservices.",
        "target_score": 84.0,
        "raw_resume": """Priya Reddy
San Jose, CA | priya.reddy@example.com | linkedin.com/in/priyareddy-dev | github.com/priyareddy

SUMMARY:
Senior Software & ML Systems Engineer with 4 years of experience building Python REST APIs, managing database clusters, and deploying Scikit-learn and PyTorch pipelines on Docker & AWS.

EXPERIENCE:
Senior Backend Engineer | CloudScale Inc. | 2022 - Present
- Designed and maintained 15+ FastAPI microservices handling 25M daily requests.
- Collaborated with ML team to wrap PyTorch recommendation models into low-latency REST endpoints.
- Optimized complex PostgreSQL query execution plans, improving p99 database response times by 35%.

Software Engineer | FinTech Systems | 2020 - 2022
- Developed financial data pipelines in Python and SQL.
- Built fraud detection scoring jobs utilizing Scikit-learn and Pandas.
- Automated container builds and deployments using Docker and GitHub Actions.

EDUCATION:
Bachelor of Science in Computer Engineering | UC Berkeley | 2016 - 2020 | GPA: 3.8/4.0

SKILLS:
- Languages: Python, SQL, JavaScript, Bash
- Frameworks: FastAPI, Django, Flask, Scikit-learn, PyTorch
- Databases: PostgreSQL, MySQL, Redis
- Tools & Cloud: Docker, AWS (EC2, S3, RDS), Git, Linux, Postman
- Soft Skills: Cross-functional Collaboration, System Architecture, Agile""",
        "parsed_json": {
            "candidate": {
                "name": "Priya Reddy",
                "email": "priya.reddy@example.com",
                "phone": "+1 (408) 555-0143",
                "location": "San Jose, CA",
                "linkedin": "https://linkedin.com/in/priyareddy-dev",
                "github": "https://github.com/priyareddy",
                "summary": "Senior Software & ML Systems Engineer with 4 years of experience."
            },
            "education": [
                {"institution": "UC Berkeley", "degree": "B.S.", "field": "Computer Engineering", "start_year": "2016", "end_year": "2020", "gpa": "3.8/4.0"}
            ],
            "experience": [
                {
                    "company": "CloudScale Inc.",
                    "job_title": "Senior Backend Engineer",
                    "start_date": "2022",
                    "end_date": "Present",
                    "description": "Designed 15+ FastAPI microservices.",
                    "technologies": ["Python", "FastAPI", "PostgreSQL", "PyTorch", "AWS"],
                    "responsibilities": ["Maintained REST services", "Served ML recommendation models"]
                }
            ],
            "skills": {
                "programming_languages": ["Python", "SQL", "JavaScript"],
                "frameworks": ["FastAPI", "Django", "Scikit-learn", "PyTorch"],
                "databases": ["PostgreSQL", "MySQL", "Redis"],
                "ai_ml": ["Machine Learning", "Model Serving", "Scikit-learn"],
                "tools": ["Docker", "AWS", "Git", "Linux"],
                "soft_skills": ["Teamwork", "Agile", "Problem Solving"]
            },
            "projects": [
                {
                    "name": "Model Serving Gateway",
                    "description": "High-throughput model serving gateway with Redis caching.",
                    "technologies": ["Python", "FastAPI", "Docker", "PyTorch"],
                    "responsibilities": "Lead Engineer",
                    "outcomes": "Reduced p99 inference latency to 28ms."
                }
            ],
            "certifications": [],
            "total_experience_years": 4.0
        },
        "match_details": {
            "matched_skills": ["Python", "SQL", "Scikit-learn", "FastAPI", "Docker", "AWS", "PyTorch"],
            "missing_skills": ["TensorFlow"],
            "partial_matches": [{"job_requirement": "Deep Learning Model Training", "candidate_evidence": "Experience serving and wrapping PyTorch models; less focus on novel architecture training", "status": "PARTIAL"}],
            "strengths": [
                "Exceptional backend and production engineering skills in Python, FastAPI, and PostgreSQL.",
                "Strong hands-on experience deploying ML models in Docker and AWS environments.",
                "4.0 years of verified industry experience comfortably exceeds the 2.0-year requirement."
            ],
            "gaps": ["Lacks deep architectural research in deep learning model development compared to pure ML researchers."],
            "critical_gaps": [],
            "justification": "Priya Reddy is a strong match (84/100). She has 4 years of solid Python/SQL/FastAPI backend and ML deployment experience with Docker/AWS. While her background leans towards ML infrastructure rather than pure deep learning research, she easily meets the core requirements."
        }
    },
    {
        "name": "Rahul Verma",
        "email": "rahul.verma@example.com",
        "phone": "+1 (206) 555-0199",
        "location": "Seattle, WA",
        "linkedin": "https://linkedin.com/in/rahulverma-ds",
        "github": "https://github.com/rahulverma",
        "current_title": "Data Scientist",
        "total_experience_years": 2.5,
        "summary": "Data Scientist with 2.5 years of experience specializing in statistical modeling, exploratory data analysis, tabular ML with Scikit-learn and XGBoost, and SQL ETL pipelines.",
        "target_score": 72.0,
        "raw_resume": """Rahul Verma
Seattle, WA | rahul.verma@example.com | linkedin.com/in/rahulverma-ds | github.com/rahulverma

SUMMARY:
Data Scientist with 2.5 years experience in predictive analytics, feature engineering, and tabular machine learning using Python, SQL, and Scikit-learn.

EXPERIENCE:
Data Scientist | RetailMetrics | 2022 - Present
- Built customer churn and lifetime value predictive models using Python, Scikit-learn, and XGBoost.
- Formulated SQL queries across BigQuery datasets to generate analytic feature tables.
- Communicated model insights and statistical A/B test results to marketing stakeholders.

Junior Data Analyst | InsightCorp | 2021 - 2022
- Created automated Tableau dashboards and cleaned messy survey data using Pandas and NumPy.

EDUCATION:
Bachelor of Science in Statistics and Applied Math | University of Washington | 2017 - 2021

SKILLS:
- Languages: Python, SQL, R
- Frameworks: Scikit-learn, Pandas, NumPy, XGBoost, Matplotlib
- Databases: PostgreSQL, BigQuery
- AI/ML: Machine Learning, Statistical Analysis, Feature Selection, A/B Testing
- Tools: Git, Jupyter Notebooks, Tableau
- Soft Skills: Analytical Thinking, Data Storytelling, Collaboration""",
        "parsed_json": {
            "candidate": {
                "name": "Rahul Verma",
                "email": "rahul.verma@example.com",
                "phone": "+1 (206) 555-0199",
                "location": "Seattle, WA",
                "linkedin": "https://linkedin.com/in/rahulverma-ds",
                "github": "https://github.com/rahulverma",
                "summary": "Data Scientist with 2.5 years of experience."
            },
            "education": [
                {"institution": "University of Washington", "degree": "B.S.", "field": "Statistics and Applied Math", "start_year": "2017", "end_year": "2021", "gpa": "3.6/4.0"}
            ],
            "experience": [
                {
                    "company": "RetailMetrics",
                    "job_title": "Data Scientist",
                    "start_date": "2022",
                    "end_date": "Present",
                    "description": "Built customer churn predictive models.",
                    "technologies": ["Python", "SQL", "Scikit-learn", "XGBoost"],
                    "responsibilities": ["Trained churn models", "Extracted features via SQL"]
                }
            ],
            "skills": {
                "programming_languages": ["Python", "SQL", "R"],
                "frameworks": ["Scikit-learn", "Pandas", "NumPy", "XGBoost"],
                "databases": ["PostgreSQL", "BigQuery"],
                "ai_ml": ["Machine Learning", "Statistical Modeling", "Feature Engineering"],
                "tools": ["Git", "Jupyter", "Tableau"],
                "soft_skills": ["Communication", "Analytical Thinking"]
            },
            "projects": [
                {
                    "name": "Churn Prediction Pipeline",
                    "description": "End-to-end churn prediction notebook and monthly batch scoring job.",
                    "technologies": ["Python", "Scikit-learn", "SQL"],
                    "responsibilities": "Lead Analyst",
                    "outcomes": "Achieved 0.84 ROC-AUC on holdout validation data."
                }
            ],
            "certifications": [],
            "total_experience_years": 2.5
        },
        "match_details": {
            "matched_skills": ["Python", "SQL", "Scikit-learn", "Machine Learning"],
            "missing_skills": ["PyTorch", "TensorFlow", "Docker", "AWS"],
            "partial_matches": [{"job_requirement": "Deep Learning", "candidate_evidence": "Strong classical ML background (Scikit-learn, XGBoost) but no neural network evidence", "status": "PARTIAL"}],
            "strengths": [
                "Solid statistical modeling and machine learning foundation with Python, Scikit-learn, and SQL.",
                "Meets experience criteria with 2.5 years in data science.",
                "Clear analytical and data exploration competencies."
            ],
            "gaps": [
                "No demonstrated experience in Deep Learning frameworks (PyTorch / TensorFlow).",
                "Lacks containerization (Docker) and Cloud deployment (AWS) qualifications."
            ],
            "critical_gaps": [],
            "justification": "Rahul Verma is a moderate match (72/100). He meets the 2-year experience threshold and has strong classical ML and SQL skills, but lacks deep learning frameworks (PyTorch/TensorFlow) and containerized deployment tooling."
        }
    },
    {
        "name": "Ananya Rao",
        "email": "ananya.rao@example.com",
        "phone": "+1 (512) 555-0177",
        "location": "Austin, TX",
        "linkedin": "https://linkedin.com/in/ananyarao-web",
        "github": "https://github.com/ananyarao",
        "current_title": "Full Stack Engineer",
        "total_experience_years": 3.0,
        "summary": "Full Stack Developer with 3 years of experience building modern React, TypeScript, and Node.js web applications with basic Python scripting.",
        "target_score": 58.0,
        "raw_resume": """Ananya Rao
Austin, TX | ananya.rao@example.com | linkedin.com/in/ananyarao-web | github.com/ananyarao

SUMMARY:
Full Stack Engineer with 3 years of web application development experience in React, TypeScript, Node.js, and REST APIs.

EXPERIENCE:
Full Stack Developer | WebCraft Digital | 2021 - Present
- Built responsive SaaS dashboards using React, Next.js, and Tailwind CSS.
- Developed backend API routes using Node.js, Express, and PostgreSQL.
- Wrote basic Python utility scripts for data migration.

EDUCATION:
Bachelor of Science in Information Technology | UT Austin | 2017 - 2021

SKILLS:
- Languages: JavaScript, TypeScript, HTML/CSS, Python (Basic), SQL
- Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
- Databases: PostgreSQL, MongoDB
- Tools: Git, Docker, Postman, Webpack
- Soft Skills: Agile, UI Design, Teamwork""",
        "parsed_json": {
            "candidate": {
                "name": "Ananya Rao",
                "email": "ananya.rao@example.com",
                "phone": "+1 (512) 555-0177",
                "location": "Austin, TX",
                "linkedin": "https://linkedin.com/in/ananyarao-web",
                "github": "https://github.com/ananyarao",
                "summary": "Full Stack Developer with 3 years experience."
            },
            "education": [
                {"institution": "UT Austin", "degree": "B.S.", "field": "Information Technology", "start_year": "2017", "end_year": "2021"}
            ],
            "experience": [
                {
                    "company": "WebCraft Digital",
                    "job_title": "Full Stack Developer",
                    "start_date": "2021",
                    "end_date": "Present",
                    "description": "Built responsive SaaS dashboards.",
                    "technologies": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
                    "responsibilities": ["Frontend development", "Backend APIs"]
                }
            ],
            "skills": {
                "programming_languages": ["JavaScript", "TypeScript", "Python", "SQL"],
                "frameworks": ["React", "Next.js", "Node.js", "Express"],
                "databases": ["PostgreSQL", "MongoDB"],
                "ai_ml": [],
                "tools": ["Docker", "Git", "Postman"],
                "soft_skills": ["Teamwork", "UI Design"]
            },
            "projects": [
                {
                    "name": "Analytics Web Portal",
                    "description": "Interactive data dashboard for marketing teams.",
                    "technologies": ["React", "TypeScript", "PostgreSQL"],
                    "responsibilities": "Frontend Lead",
                    "outcomes": "Delivered on schedule with 99.9% uptime."
                }
            ],
            "certifications": [],
            "total_experience_years": 3.0
        },
        "match_details": {
            "matched_skills": ["Python", "SQL", "Docker"],
            "missing_skills": ["Machine Learning", "PyTorch", "TensorFlow", "Scikit-learn", "Deep Learning"],
            "partial_matches": [{"job_requirement": "Python Proficiency", "candidate_evidence": "Basic Python scripting mentioned alongside JavaScript/TypeScript", "status": "PARTIAL"}],
            "strengths": [
                "Strong software engineering fundamentals with 3 years of full stack experience.",
                "Possesses Docker, SQL, and database management capabilities."
            ],
            "gaps": [
                "Lacks core Machine Learning, Deep Learning, and AI model development skills.",
                "Missing PyTorch, TensorFlow, and Scikit-learn frameworks."
            ],
            "critical_gaps": ["Critical Gap: Mandatory Machine Learning & Deep Learning skill requirements not demonstrated in resume."],
            "justification": "Ananya Rao is a weak match (58/100) for a Machine Learning Engineer role. While she is a capable Full Stack developer with 3 years of experience and Docker skills, she lacks the mandatory ML/DL domain competencies."
        }
    },
    {
        "name": "Vikram Singh",
        "email": "vikram.singh@example.com",
        "phone": "+1 (617) 555-0129",
        "location": "Boston, MA",
        "linkedin": "https://linkedin.com/in/vikramsingh-dev",
        "github": "https://github.com/vikramsingh",
        "current_title": "Junior Developer Intern",
        "total_experience_years": 0.5,
        "summary": "Recent graduate and software engineering intern with introductory coursework in Python and basic database concepts.",
        "target_score": 41.0,
        "raw_resume": """Vikram Singh
Boston, MA | vikram.singh@example.com | linkedin.com/in/vikramsingh-dev | github.com/vikramsingh

SUMMARY:
Recent graduate seeking entry-level software opportunities. Familiar with Python, HTML/CSS, and basic SQL.

EXPERIENCE:
Software Intern | TechStart Solutions | Summer 2023 (4 months)
- Assisted senior developers in debugging web pages and writing unit tests.
- Formatted CSV datasets for internal reports.

EDUCATION:
Bachelor of Science in Information Systems | Boston University | 2019 - 2023 | GPA: 3.2/4.0

SKILLS:
- Languages: Python (Introductory), HTML, CSS, JavaScript, SQL (Basic)
- Databases: SQLite
- Tools: Git, VS Code
- Soft Skills: Eager to learn, Communication""",
        "parsed_json": {
            "candidate": {
                "name": "Vikram Singh",
                "email": "vikram.singh@example.com",
                "phone": "+1 (617) 555-0129",
                "location": "Boston, MA",
                "linkedin": "https://linkedin.com/in/vikramsingh-dev",
                "github": "https://github.com/vikramsingh",
                "summary": "Recent graduate and software engineering intern."
            },
            "education": [
                {"institution": "Boston University", "degree": "B.S.", "field": "Information Systems", "start_year": "2019", "end_year": "2023", "gpa": "3.2/4.0"}
            ],
            "experience": [
                {
                    "company": "TechStart Solutions",
                    "job_title": "Software Intern",
                    "start_date": "05/2023",
                    "end_date": "08/2023",
                    "description": "Assisted senior developers in debugging.",
                    "technologies": ["Python", "Git", "HTML"],
                    "responsibilities": ["Wrote unit tests", "Formatted CSVs"]
                }
            ],
            "skills": {
                "programming_languages": ["Python", "JavaScript", "SQL"],
                "frameworks": [],
                "databases": ["SQLite"],
                "ai_ml": [],
                "tools": ["Git"],
                "soft_skills": ["Communication"]
            },
            "projects": [],
            "certifications": [],
            "total_experience_years": 0.5
        },
        "match_details": {
            "matched_skills": ["Python", "SQL"],
            "missing_skills": ["Machine Learning", "PyTorch", "TensorFlow", "Deep Learning", "Scikit-learn", "Docker", "AWS"],
            "partial_matches": [],
            "strengths": ["Basic foundational knowledge of Python and SQL from academic background."],
            "gaps": [
                "Lacks the required 2+ years of professional engineering experience (has only 0.5 years).",
                "No demonstrated machine learning or deep learning project experience.",
                "Missing cloud and containerization skills."
            ],
            "critical_gaps": [
                "Critical Experience Gap: Required 2+ years of experience; candidate has 0.5 years.",
                "Critical Skill Gap: Mandatory Deep Learning and ML frameworks completely absent."
            ],
            "justification": "Vikram Singh is a poor match (41/100) due to major experience and skill deficits. The role requires 2+ years of production ML engineering, while the candidate is an entry-level intern with 0.5 years and only introductory Python knowledge."
        }
    }
]

def seed_database(db: Session) -> None:
    """Seed sample job descriptions, candidates, resumes, screening session, and match results."""
    # Check if database already has candidates
    if db.query(Candidate).count() > 0:
        return

    scoring_engine = ScoringEngine()

    # 1. Create Job Descriptions
    db_jobs = []
    for jd_data in SAMPLE_JOB_DESCRIPTIONS:
        job = JobDescription(
            title=jd_data["title"],
            company=jd_data["company"],
            experience_required=jd_data["experience_required"],
            location=jd_data["location"],
            salary_range=jd_data["salary_range"],
            raw_text=jd_data["raw_text"],
            structured_json=jd_data["structured_json"]
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        db_jobs.append(job)

    primary_job = db_jobs[0]  # Machine Learning Engineer

    # 2. Create Screening Session for ML Engineer role
    session = ScreeningSession(
        job_id=primary_job.id,
        title=f"Screening: {primary_job.title} at {primary_job.company}",
        status="COMPLETED",
        total_candidates=len(SAMPLE_CANDIDATES),
        prompt_version="candidate_matcher_v1.0"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    total_score = 0.0
    top_score = 0.0
    top_name = ""

    # 3. Create Candidates, Resumes, and Match Results
    for cand_info in SAMPLE_CANDIDATES:
        cand = Candidate(
            name=cand_info["name"],
            email=cand_info["email"],
            phone=cand_info["phone"],
            location=cand_info["location"],
            linkedin=cand_info["linkedin"],
            github=cand_info["github"],
            current_title=cand_info["current_title"],
            total_experience_years=cand_info["total_experience_years"],
            summary=cand_info["summary"]
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)

        resume = Resume(
            candidate_id=cand.id,
            filename=f"{cand.name.lower().replace(' ', '_')}_resume.pdf",
            file_size_bytes=1024 * 45,
            file_type="pdf",
            raw_text=cand_info["raw_resume"],
            parsed_json=cand_info["parsed_json"],
            parsing_status="SUCCESS"
        )
        db.add(resume)
        db.commit()

        # Match Result
        md = cand_info["match_details"]
        score = cand_info["target_score"]
        total_score += score
        if score > top_score:
            top_score = score
            top_name = cand.name

        # Calculate category scores
        tech_share = min(35.0, (len(md["matched_skills"]) / 7.0) * 35.0)
        exp_share = 20.0 if cand.total_experience_years >= 2.0 else max(5.0, (cand.total_experience_years / 2.0) * 20.0)
        resp_share = min(15.0, (score / 100.0) * 15.0)
        proj_share = 10.0 if len(cand_info["parsed_json"]["projects"]) >= 1 else 4.0
        edu_share = 5.0
        pref_share = 8.0 if "Docker" in md["matched_skills"] or "AWS" in md["matched_skills"] else 2.0
        soft_share = 4.5

        rec_label = "EXCELLENT MATCH" if score >= 90 else ("STRONG MATCH" if score >= 75 else ("MODERATE MATCH" if score >= 60 else ("WEAK MATCH" if score >= 40 else "POOR MATCH")))

        # Recruiter decision seed
        decision_val = "SHORTLISTED" if score >= 84 else ("REVIEW" if score >= 70 else "UNDECIDED")
        rec_decision = RecruiterDecision(
            candidate_id=cand.id,
            job_id=primary_job.id,
            decision=decision_val,
            notes="Evaluated during preliminary screening session." if decision_val == "SHORTLISTED" else ""
        )
        db.add(rec_decision)

        match_res = MatchResult(
            session_id=session.id,
            candidate_id=cand.id,
            overall_score=score,
            recommendation=rec_label,
            confidence=0.92 if score > 70 else 0.85,
            technical_skills_score=round(tech_share, 1),
            experience_score=round(exp_share, 1),
            responsibilities_score=round(resp_share, 1),
            projects_score=round(proj_share, 1),
            education_score=round(edu_share, 1),
            preferred_skills_score=round(pref_share, 1),
            soft_skills_score=round(soft_share, 1),
            penalty_deduction=15.0 if md.get("critical_gaps") else 0.0,
            matched_skills=md["matched_skills"],
            missing_skills=md["missing_skills"],
            partial_matches=md["partial_matches"],
            strengths=md["strengths"],
            gaps=md["gaps"],
            critical_gaps=md["critical_gaps"],
            evidence=[{"requirement": s, "evidence": f"Explicitly listed and verified in candidate profile.", "status": "MATCH"} for s in md["matched_skills"][:4]],
            justification=md["justification"],
            prompt_version="candidate_matcher_v1.0"
        )
        db.add(match_res)
        db.commit()

    session.average_score = round(total_score / len(SAMPLE_CANDIDATES), 1)
    session.top_candidate_name = top_name
    db.commit()
