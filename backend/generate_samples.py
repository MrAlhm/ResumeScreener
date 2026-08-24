import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

SAMPLE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_data"))
RESUMES_DIR = os.path.join(SAMPLE_DIR, "resumes")
JDS_DIR = os.path.join(SAMPLE_DIR, "job_descriptions")

os.makedirs(RESUMES_DIR, exist_ok=True)
os.makedirs(JDS_DIR, exist_ok=True)

RESUME_TEXTS = {
    "1_aarav_sharma_ml_lead": """Aarav Sharma
San Francisco, CA | aarav.sharma@example.com | +1 (415) 555-0182 | linkedin.com/in/aaravsharma-ml | github.com/aaravsharma

PROFESSIONAL SUMMARY
Accomplished Lead Machine Learning Engineer with 5 years of experience building scalable deep learning systems, multi-modal transformer models, and high-throughput REST inference APIs. Proven track record deploying containerized models in production on AWS with sub-50ms latency.

PROFESSIONAL EXPERIENCE
DeepVision AI — Senior Machine Learning Engineer (2022 - Present)
• Architected and trained multi-modal transformer models in PyTorch, improving contextual search accuracy by 34% and reducing inference latency by 42%.
• Built high-throughput asynchronous inference microservices using FastAPI, Redis caching, and Docker deployed on AWS ECS.
• Created robust feature engineering pipelines querying multi-terabyte PostgreSQL and Snowflake data warehouses.
• Led a team of 4 junior ML engineers and established MLOps best practices with MLflow and GitHub Actions.

Apex Data Labs — Machine Learning Engineer (2020 - 2022)
• Developed predictive classification and time-series forecasting models using Scikit-learn and TensorFlow.
• Implemented automated CI/CD model evaluation and data validation pipelines using Git, Docker, and MLflow.
• Optimized SQL ETL queries reducing data pipeline runtimes from 4 hours to 45 minutes.

EDUCATION
Stanford University — Master of Science in Computer Science (AI Track), 2018 - 2020 (GPA: 3.9/4.0)
IIT Bombay — Bachelor of Technology in Computer Science, 2014 - 2018 (GPA: 3.85/4.0)

TECHNICAL SKILLS
• Programming Languages: Python, SQL, C++, Bash
• Frameworks: PyTorch, TensorFlow, FastAPI, Scikit-learn, HuggingFace Transformers, LangChain
• Databases & Data: PostgreSQL, Redis, Snowflake, BigQuery
• AI/ML: Deep Learning, NLP, RAG, Computer Vision, Transformers, LLM Fine-tuning, MLOps
• Tools & Cloud: Docker, Kubernetes, AWS (EC2, S3, ECS, Lambda), Git, Linux, CI/CD
• Soft Skills: Technical Leadership, Cross-functional Collaboration, Mentorship, Problem Solving

KEY PROJECTS
• Enterprise RAG Platform: Built an enterprise retrieval-augmented generation engine using LangChain, PyTorch, and Milvus vector search serving 10,000+ daily queries with 98% precision.
• High-Speed Vision Classifier: Deployed quantized ResNet and ViT models on AWS Lambda with sub-50ms p95 latency.

CERTIFICATIONS
• AWS Certified Machine Learning - Specialty (2023)
""",

    "2_priya_reddy_senior_backend": """Priya Reddy
San Jose, CA | priya.reddy@example.com | +1 (408) 555-0143 | linkedin.com/in/priyareddy-dev | github.com/priyareddy

PROFESSIONAL SUMMARY
Senior Software & ML Systems Engineer with 4 years of experience building high-concurrency Python/FastAPI backends, optimizing relational database architectures, and deploying PyTorch & Scikit-learn inference microservices on Docker and AWS.

PROFESSIONAL EXPERIENCE
CloudScale Inc. — Senior Backend Engineer (2022 - Present)
• Designed, built, and maintained 15+ FastAPI microservices handling 25M daily requests with 99.99% uptime.
• Collaborated with data science teams to wrap PyTorch recommendation models into low-latency REST endpoints.
• Optimized complex PostgreSQL query execution plans, improving p99 database response times by 35%.
• Architected cloud infrastructure using Docker, AWS (EC2, S3, RDS), and Terraform.

FinTech Systems — Software Engineer (2020 - 2022)
• Developed financial transaction data pipelines in Python and SQL.
• Built fraud detection scoring jobs utilizing Scikit-learn, XGBoost, and Pandas.
• Automated container builds and continuous deployments using Docker and GitHub Actions.

EDUCATION
UC Berkeley — Bachelor of Science in Computer Engineering, 2016 - 2020 (GPA: 3.8/4.0)

TECHNICAL SKILLS
• Programming Languages: Python, SQL, JavaScript, Bash
• Frameworks: FastAPI, Django, Flask, Scikit-learn, PyTorch
• Databases: PostgreSQL, MySQL, Redis
• Tools & Cloud: Docker, AWS (EC2, S3, RDS), Git, Linux, Postman, CI/CD
• Soft Skills: Cross-functional Collaboration, System Architecture, Agile, Problem Solving

KEY PROJECTS
• Model Serving Gateway: High-throughput model serving gateway with Redis caching, reducing p99 inference latency to 28ms.
• Distributed Transaction Ledger: Resilient ledger service with idempotency keys in PostgreSQL.
""",

    "3_rahul_verma_data_scientist": """Rahul Verma
Seattle, WA | rahul.verma@example.com | +1 (206) 555-0199 | linkedin.com/in/rahulverma-ds | github.com/rahulverma

PROFESSIONAL SUMMARY
Data Scientist with 2.5 years of experience in predictive modeling, feature engineering, exploratory data analysis, and tabular machine learning using Python, SQL, Scikit-learn, and XGBoost.

PROFESSIONAL EXPERIENCE
RetailMetrics — Data Scientist (2022 - Present)
• Built customer churn and lifetime value predictive models using Python, Scikit-learn, and XGBoost with 0.84 ROC-AUC.
• Formulated complex SQL queries across BigQuery datasets to generate analytic feature tables.
• Designed and analyzed statistical A/B tests for marketing campaigns, increasing conversion by 12%.
• Communicated statistical model insights and visualizations to senior non-technical business stakeholders.

InsightCorp — Junior Data Analyst (2021 - 2022)
• Created automated Tableau dashboards and cleaned messy customer datasets using Pandas and NumPy.
• Maintained automated SQL reports and weekly data validation scripts.

EDUCATION
University of Washington — Bachelor of Science in Statistics & Applied Mathematics, 2017 - 2021 (GPA: 3.6/4.0)

TECHNICAL SKILLS
• Programming Languages: Python, SQL, R
• Frameworks: Scikit-learn, Pandas, NumPy, XGBoost, Matplotlib, Seaborn
• Databases: PostgreSQL, Google BigQuery
• AI/ML: Machine Learning, Statistical Analysis, Feature Selection, A/B Testing, Predictive Modeling
• Tools: Git, Jupyter Notebooks, Tableau
• Soft Skills: Analytical Thinking, Data Storytelling, Collaboration, Communication

KEY PROJECTS
• Churn Prediction Pipeline: End-to-end churn prediction notebook and monthly batch scoring job achieving 0.84 ROC-AUC.
• E-Commerce Price Elasticity Model: Formulated regression models to estimate product price sensitivity.
""",

    "4_ananya_rao_fullstack_dev": """Ananya Rao
Austin, TX | ananya.rao@example.com | +1 (512) 555-0177 | linkedin.com/in/ananyarao-web | github.com/ananyarao

PROFESSIONAL SUMMARY
Full Stack Engineer with 3 years of web application development experience in React, TypeScript, Node.js, Express, and PostgreSQL. Experienced with containerization and building responsive user interfaces.

PROFESSIONAL EXPERIENCE
WebCraft Digital — Full Stack Developer (2021 - Present)
• Built responsive SaaS dashboards using React, Next.js, TypeScript, and Tailwind CSS.
• Developed backend API routes using Node.js, Express, and PostgreSQL.
• Wrote basic Python utility scripts for data migration and automation.
• Collaborated in an agile scrum team with bi-weekly sprint cycles.

EDUCATION
UT Austin — Bachelor of Science in Information Technology, 2017 - 2021 (GPA: 3.5/4.0)

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, HTML/CSS, Python (Basic), SQL
• Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
• Databases: PostgreSQL, MongoDB
• Tools: Git, Docker, Postman, Webpack, Vite
• Soft Skills: Teamwork, UI Design, Problem Solving, Agile

KEY PROJECTS
• Analytics Web Portal: Interactive data visualization dashboard for marketing teams with React and Tailwind CSS.
• E-commerce Storefront: Full stack web app with stripe checkout and cart management.
""",

    "5_vikram_singh_junior_intern": """Vikram Singh
Boston, MA | vikram.singh@example.com | +1 (617) 555-0129 | linkedin.com/in/vikramsingh-dev | github.com/vikramsingh

PROFESSIONAL SUMMARY
Recent graduate seeking entry-level software opportunities. Familiar with introductory Python scripting, HTML/CSS, Git, and fundamental database concepts.

PROFESSIONAL EXPERIENCE
TechStart Solutions — Software Intern (May 2023 - Aug 2023, 4 months)
• Assisted senior developers in debugging web pages and writing unit test cases.
• Formatted and cleaned CSV datasets for internal reports using Excel and basic Python scripts.
• Participated in daily standups and code reviews.

EDUCATION
Boston University — Bachelor of Science in Information Systems, 2019 - 2023 (GPA: 3.2/4.0)

TECHNICAL SKILLS
• Programming Languages: Python (Introductory), HTML, CSS, JavaScript, SQL (Basic)
• Databases: SQLite
• Tools: Git, VS Code, GitHub
• Soft Skills: Eager to learn, Communication, Diligent

COURSEWORK PROJECTS
• Student Library Manager: Simple command-line book checkout tool written in Python with SQLite database.
• Personal Portfolio Website: Responsive personal website built with HTML5, CSS3, and JavaScript.
"""
}

def create_pdf(filename: str, content: str):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold"
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#334155")
    )
    
    heading_style = ParagraphStyle(
        'DocHeading',
        parent=styles['Heading2'],
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#1e293b"),
        fontName="Helvetica-Bold",
        spaceBefore=8,
        spaceAfter=4
    )

    story = []
    lines = content.strip().split("\n")
    
    # First line is name
    story.append(Paragraph(lines[0], title_style))
    story.append(Spacer(1, 4))
    
    # Second line is contact
    if len(lines) > 1:
        story.append(Paragraph(lines[1], body_style))
        story.append(Spacer(1, 6))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=8))

    for line in lines[2:]:
        trimmed = line.strip()
        if not trimmed:
            story.append(Spacer(1, 4))
        elif trimmed.isupper() and len(trimmed) < 40:
            story.append(Paragraph(trimmed, heading_style))
        elif "—" in trimmed or ("(" in trimmed and ")" in trimmed and ("20" in trimmed or "Present" in trimmed)):
            sub_style = ParagraphStyle('DocSub', parent=heading_style, fontSize=10, textColor=colors.HexColor("#2563eb"))
            story.append(Paragraph(trimmed, sub_style))
        else:
            story.append(Paragraph(trimmed, body_style))

    doc.build(story)

def main():
    print("Generating sample resumes (PDF and TXT)...")
    for key, text in RESUME_TEXTS.items():
        pdf_path = os.path.join(RESUMES_DIR, f"{key}.pdf")
        txt_path = os.path.join(RESUMES_DIR, f"{key}.txt")
        create_pdf(pdf_path, text)
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text.strip())
        print(f"Generated: {pdf_path} and {txt_path}")

    # Job descriptions
    from app.seed_data import SAMPLE_JOB_DESCRIPTIONS
    for idx, jd in enumerate(SAMPLE_JOB_DESCRIPTIONS):
        slug = jd["title"].lower().replace(" ", "_")
        jd_path = os.path.join(JDS_DIR, f"{slug}.txt")
        with open(jd_path, "w", encoding="utf-8") as f:
            f.write(jd["raw_text"].strip())
        print(f"Generated JD: {jd_path}")

if __name__ == "__main__":
    main()
