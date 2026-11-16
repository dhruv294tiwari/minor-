import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.admin import Admin
from app.models.category import Category
from app.models.knowledge import KnowledgeEntry
from app.utils.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mait_seed")


def seed_database():
    """Seed initial categories, knowledge entries, and default admin user."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Create or update Default Admin
        admin_user = db.query(Admin).filter(Admin.username == "admin").first()
        if not admin_user:
            admin_user = Admin(
                username="admin",
                email="admin@mait.ac.in",
                password_hash=get_password_hash("admin123")
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            logger.info("✓ Created default admin user: 'admin' (Password: 'admin123')")
        else:
            logger.info("Admin user 'admin' already exists.")

        # 2. Initial Categories
        initial_categories = [
            {"name": "Admissions", "description": "Admission guidelines, counseling, eligibility criteria, and enrollment procedures."},
            {"name": "Fees", "description": "Tuition fees, payment deadlines, fee breakdown, and online payment portal instructions."},
            {"name": "Examinations", "description": "End-semester exams, mid-term tests, datesheets, admit cards, and evaluation rules."},
            {"name": "Timetable", "description": "Class schedules, lab timings, academic calendar, and section allocations."},
            {"name": "Academics", "description": "Curriculum, 75% attendance policy, grading system, backlogs, and academic regulations."},
            {"name": "Student Services", "description": "Student welfare, ID cards, bonafide certificates, train/bus concessions, and grievances."},
            {"name": "Facilities", "description": "Central Library, laboratories, auditorium, sports complex, cafeteria, and Wi-Fi access."},
            {"name": "Notices", "description": "Official college circulars, administrative announcements, and event updates."},
            {"name": "Departments", "description": "Engineering branches (CSE, IT, ECE, EEE, ME, etc.), faculty, and lab infrastructures."},
            {"name": "General College Information", "description": "Institute overview, affiliation with GGSIPU, AICTE approval, location, and contacts."}
        ]

        cat_map = {}
        for cat_data in initial_categories:
            cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not cat:
                cat = Category(name=cat_data["name"], description=cat_data["description"])
                db.add(cat)
                db.commit()
                db.refresh(cat)
                logger.info(f"✓ Created category: {cat.name}")
            cat_map[cat.name] = cat.id

        # 3. Demonstration Knowledge Entries
        demo_entries = [
            {
                "category_name": "General College Information",
                "title": "MAIT Overview, Affiliation and Accreditation",
                "question": "What is MAIT and which university is it affiliated to?",
                "answer": "Maharaja Agrasen Institute of Technology (MAIT) is a premier engineering college established in 1999 by the Maharaja Agrasen Technical Education Society. It is affiliated with Guru Gobind Singh Indraprastha University (GGSIPU), Delhi, and approved by the All India Council for Technical Education (AICTE). MAIT is recognized for excellence in engineering and management education.",
                "keywords": "mait, overview, affiliation, ggsiu, ipu, aicte, establishment, campus, college info",
                "source": "Official MAIT Prospectus",
                "source_url": "https://mait.ac.in",
                "verified": True
            },
            {
                "category_name": "General College Information",
                "title": "MAIT Campus Location and Address",
                "question": "Where is MAIT located and what is its address?",
                "answer": "MAIT is located at: PSP Area, Plot No. 1, Sector-22, Rohini, New Delhi - 110086, India. Nearest metro stations include Rithala (Red Line) and Samaypur Badli (Yellow Line), with connecting feeder buses and e-rickshaws.",
                "keywords": "location, address, rohini, metro, directions, where is mait, reach",
                "source": "MAIT Contact Directory",
                "source_url": "https://mait.ac.in/index.php/contact-us",
                "verified": True
            },
            {
                "category_name": "Admissions",
                "title": "B.Tech Admission Eligibility & Counseling Process",
                "question": "How can I take admission in B.Tech at MAIT?",
                "answer": "B.Tech admissions at MAIT are conducted through centralized online counseling by Guru Gobind Singh Indraprastha University (GGSIPU). Candidates must qualify in JEE Main (Paper 1) conducted by NTA and have passed 10+2 with Physics, Chemistry, and Mathematics (minimum 55% aggregate, with pass in English). Candidates must register on the GGSIPU admission portal (ipu.admissions.nic.in) during the active counseling cycle.",
                "keywords": "admission, btech, eligibility, jee main, counseling, ggsipu, cut off, apply, seats",
                "source": "GGSIPU Admission Brochure & MAIT Guidelines",
                "source_url": "http://www.ipu.ac.in",
                "verified": True
            },
            {
                "category_name": "Fees",
                "title": "Annual Academic Fee Payment Guidelines",
                "question": "How do I pay the semester/annual college fee at MAIT?",
                "answer": "Annual and semester college fees must be paid online through the official MAIT ERP/Payment portal or bank challan as notified on the official website. For newly admitted students, part academic fee is deposited during GGSIPU centralized counseling, and the balance fee is submitted directly to MAIT upon physical reporting.",
                "keywords": "fee, payment, challan, tuition fee, semester fee, online payment, fee structure, balance fee",
                "source": "MAIT Accounts Office Circular",
                "source_url": "https://mait.ac.in",
                "verified": True
            },
            {
                "category_name": "Examinations",
                "title": "End-Semester Examination Schedule & Guidelines",
                "question": "When are semester exams conducted at MAIT?",
                "answer": "Semester examinations at MAIT are conducted according to the academic calendar and datesheet issued by Guru Gobind Singh Indraprastha University (GGSIPU). Typically, Odd Semester (1st, 3rd, 5th, 7th Sem) theory and practical exams are held in December-January, and Even Semester (2nd, 4th, 6th, 8th Sem) exams are held in May-June.",
                "keywords": "exam, examination, schedule, datesheet, endsem, midsem, exam date, ggsipu exam, exam kab hai",
                "source": "GGSIPU Examination Division Notice",
                "source_url": "http://www.ipu.ac.in/exam_notices.php",
                "verified": True
            },
            {
                "category_name": "Academics",
                "title": "Mandatory 75% Attendance Requirement",
                "question": "What is the minimum attendance required at MAIT?",
                "answer": "As per GGSIPU Ordinance 11, every student is strictly required to maintain a minimum of 75% attendance in aggregate across all lectures, tutorials, and practical classes. Students falling short of the requisite attendance are liable to be detained from appearing in the End-Semester University Examinations.",
                "keywords": "attendance, 75%, detention, policy, minimum attendance, shortage, classes",
                "source": "GGSIPU Academic Ordinance 11",
                "source_url": "http://www.ipu.ac.in",
                "verified": True
            },
            {
                "category_name": "Facilities",
                "title": "Central Library Services & Timings",
                "question": "What are the Central Library timings and book lending rules?",
                "answer": "The MAIT Central Library is located in the Main Academic Block and operates from 8:30 AM to 6:00 PM on all working days. It houses over 100,000 volumes, international journals, and an e-Library with IEEE/Springer access. Students are issued a library card allowing them to borrow up to 4 books for a 14-day duration.",
                "keywords": "library, books, timings, central library, reading room, journals, issue, return",
                "source": "MAIT Central Library Notice",
                "source_url": "https://mait.ac.in",
                "verified": True
            },
            {
                "category_name": "Departments",
                "title": "Computer Science & Engineering (CSE) Department",
                "question": "Tell me about the CSE Department at MAIT.",
                "answer": "The Department of Computer Science & Engineering (CSE) at MAIT is NBA-accredited and offers B.Tech and M.Tech programs. The department features state-of-the-art computing laboratories equipped with high-performance workstations, GPU clusters for AI/ML research, IoT labs, and active student chapters including ACM, CSI, and Google Developer Groups (GDG).",
                "keywords": "cse, computer science, department, labs, faculty, nba accredited, engineering branches",
                "source": "MAIT CSE Department Profile",
                "source_url": "https://mait.ac.in",
                "verified": True
            },
            {
                "category_name": "Student Services",
                "title": "Student Grievance Redressal and Welfare Office",
                "question": "How can students submit grievances or apply for bonafide certificates?",
                "answer": "Students can apply for Bonafide Certificates, Character Certificates, and submit academic or administrative grievances through the Student Welfare Office located in the Administrative Block (Ground Floor, Room 104). Applications are processed within 2-3 working days.",
                "keywords": "student services, grievance, bonafide certificate, character certificate, welfare, admin block",
                "source": "Student Welfare Office Manual",
                "source_url": "https://mait.ac.in",
                "verified": True
            },
            {
                "category_name": "Facilities",
                "title": "Campus Sports, Cafeteria & Medical Room Amenities",
                "question": "What sports, cafeteria, and medical facilities are available on campus?",
                "answer": "MAIT provides comprehensive on-campus student amenities including a multi-cuisine cafeteria, Nescafe kiosk, sports grounds for cricket, football, basketball, and badminton, an indoor gymnasium, and a dedicated Medical Room with a qualified nurse and visiting physician during college hours.",
                "keywords": "sports, cafeteria, canteen, medical, gym, ground, basketball, food, health",
                "source": "MAIT Campus Life Guide",
                "source_url": "https://mait.ac.in",
                "verified": True
            }
        ]

        for entry_data in demo_entries:
            cat_id = cat_map.get(entry_data["category_name"])
            if not cat_id:
                continue

            existing = db.query(KnowledgeEntry).filter(KnowledgeEntry.title == entry_data["title"]).first()
            if not existing:
                entry = KnowledgeEntry(
                    category_id=cat_id,
                    title=entry_data["title"],
                    question=entry_data["question"],
                    answer=entry_data["answer"],
                    keywords=entry_data["keywords"],
                    source=entry_data["source"],
                    source_url=entry_data["source_url"],
                    verified=entry_data["verified"],
                    created_by="admin",
                    updated_by="admin"
                )
                db.add(entry)
                logger.info(f"✓ Added verified entry: '{entry_data['title']}'")

        db.commit()
        logger.info("★ Database seeded successfully with initial verified records!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
