import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">CMR<span className="text-secondary">CET</span></h3>
            <p className="text-primary-foreground/70 mb-4 text-sm leading-relaxed">
              CMR College of Engineering & Technology - Explore to Invent. 
              NAAC A+ Accredited, UGC Autonomous institution with 23 years of excellence.
            </p>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm font-semibold">
                EAMCET: CMRK
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {['About Us', 'Academics', 'Admissions', 'Placements', 'Research', 'Student Life', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-secondary transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Departments</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {['Computer Science', 'Information Technology', 'Electronics & Comm.', 'Electrical & Electronics', 'Mechanical', 'Civil', 'MBA'].map((dept) => (
                <li key={dept}>
                  <a href="#" className="hover:text-secondary transition-colors">{dept}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/70">
                  Kandlakoya, Medchal Road,<br />
                  Hyderabad - 501401,<br />
                  Telangana, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary" />
                <a href="tel:+914064635858" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  +91-40-64635858
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                <a href="mailto:info@cmrcet.ac.in" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  info@cmrcet.ac.in
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© 2024 CMR College of Engineering & Technology. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-secondary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-secondary transition-colors">RTI</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
