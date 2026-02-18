import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState(["React", "Node.js"]);
  const [skillInput, setSkillInput] = useState("");
  const [photo, setPhoto] = useState(null);

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 px-6 py-24 text-white">

      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 px-6 py-2 rounded-xl bg-white/20 hover:bg-white/30"
        >
          Back to Dashboard
        </button>

        <div className="bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl">

          {/* HEADER */}
          <div className="flex items-center gap-6 mb-10">

            <div className="relative">

              {photo ? (
                <img
                  src={photo}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border border-white/30 object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border border-white/30 flex items-center justify-center text-white/50">
                  Upload
                </div>
              )}

              <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer">
                ✎
                <input hidden type="file" onChange={handlePhotoUpload} />
              </label>

            </div>

            <div>
              <h1 className="text-4xl font-extrabold">Edit Profile</h1>
              <p className="text-white/70">Complete your profile to attract recruiters</p>

              {photo && (
                <button
                  onClick={() => setPhoto(null)}
                  className="text-red-300 text-sm mt-2"
                >
                  Remove Photo
                </button>
              )}
            </div>

          </div>

          {/* BASIC INFO */}
          <Section title="Basic Information">
            <Grid>
              <Input label="Full Name" />
              <Input label="Email Address" />
              <Input label="Location" />
              <Input label="Phone Number" />
            </Grid>
          </Section>

          {/* SUMMARY */}
          <Section title="Professional Summary">
            <textarea className="input h-32" placeholder="Career summary..." />
          </Section>

          {/* SKILLS */}
          <Section title="Skills">

            <div className="flex gap-3 mb-4">
              <input
                className="input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add skill"
              />

              <button onClick={addSkill} className="px-6 bg-indigo-600 rounded-xl">
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span key={skill} className="px-4 py-1 bg-white/20 rounded-full flex gap-2">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-red-400">×</button>
                </span>
              ))}
            </div>

          </Section>

          {/* EDUCATION */}
          <Section title="Education">
            <Grid>
              <Input label="College" />
              <Input label="Degree" />
              <Input label="Passing Year" />
              <Input label="CGPA" />
            </Grid>
          </Section>

          {/* EXPERIENCE */}
          <Section title="Experience">
            <Grid>
              <Input label="Role" />
              <Input label="Company" />
            </Grid>
            <textarea className="input h-24 mt-4" placeholder="Experience details..." />
          </Section>

          {/* LINKS */}
          <Section title="Professional Links">
            <Grid>
              <Input label="GitHub" />
              <Input label="LinkedIn" />
              <Input label="Portfolio" />
            </Grid>
          </Section>

          {/* PROFILE BAR */}
          <div className="mt-10">
            <p className="text-sm text-white/70 mb-2">Profile Strength</p>

            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full w-[80%]" />
            </div>

            <p className="text-sm mt-2 text-white/70">80% Complete</p>
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex gap-4">
            <button className="px-10 py-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl font-semibold hover:scale-105">
              Save Profile
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-10 py-3 bg-white/20 rounded-xl"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const Input = ({ label }) => (
  <input className="input" placeholder={label} />
);
