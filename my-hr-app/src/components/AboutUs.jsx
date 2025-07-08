import React, { useState } from 'react';

const teamMembers = [
  {
    name: 'Iris West',
    role: 'HR Consultant',
    img: '/images/Iris.jpg',
  },
  {
    name: 'Delainey Hayles',
    role: 'Senior HR Manager',
    img: '/images/d.jpg',
    highlight: true,
  },
  {
    name: 'Louis De Pointe',
    role: 'Talent Acquisition Specialist',
    img: '/images/Louis.jpg',
  },
  {
    name: 'Bailey Bass',
    role: 'Employee Relations Expert',
    img: '/images/b.jpg',
  },
];

const historyData = {
  2020: {
    title: '2020 - Founded in Nairobi, Kenya',
    description: (
      <>
        <p><b>Comprehensive Recruitment:</b> Helping organizations attract, hire, and retain top talent to build a competitive workforce.</p>
        <p><b>Employee Development:</b> Designing training programs and career pathing to enhance employee skills and satisfaction.</p>
        <p><b>HR Compliance:</b> Ensuring companies adhere to labor laws, workplace safety, and diversity regulations.</p>
      </>
    ),
    img: '/images/1.jpg', 
  },
};

const AboutUs = () => {
  const [selectedYear, setSelectedYear] = useState(2020);

  const { title, description, img } = historyData[selectedYear];

  return (
    <div className="about-container">
     

      <section className="about-hero">

        <div className="about-hero-image">
          <img src="/images/work.jpg" alt="About Us" />
        </div>
        <div className="about-hero-text">
          <h1>Empowering Workplaces,<br />Building Stronger Teams</h1>
          <p>
            Our culture is rooted in fostering inclusive, productive, and engaging work environments. We drive innovation in HR practices tailored to your unique organizational needs.
          </p>
          <p>
            Our expert HR consultants bring years of experience in talent management, compliance, and employee engagement to help your business thrive.
          </p>
          <div className="about-stats">
            <div>
              <span className="stat-number">500+</span>
              <span className="stat-label">Successful Placements</span>
            </div>
            <div>
              <span className="stat-number">200+</span>
              <span className="stat-label">Companies Served</span>
            </div>
            <div>
              <span className="stat-number">95%</span>
              <span className="stat-label">Client Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      <section className="history-section">
        <h2>Our Journey</h2>
        <div className="history-timeline">
          {Object.keys(historyData).map((year) => (
            <button
              key={year}
              className={`year-button ${selectedYear === parseInt(year) ? 'active' : ''}`}
              onClick={() => setSelectedYear(parseInt(year))}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="history-content">
          <div className="history-image">
            <img src={historyData[selectedYear].img} alt={`History ${selectedYear}`} />
          </div>
          <div className="history-text">
            <h3>{title}</h3>
            {description}
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-cards">
          {teamMembers.map((member, index) => (
            <div key={index} className={`team-card ${member.highlight ? 'highlight' : ''}`}>
              <img src={member.img} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
           
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
