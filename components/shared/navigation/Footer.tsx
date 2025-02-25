"use client";

import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
  const links = {
    product: [
      { name: 'Pricing', href: '/pricing' },
    ],
    resources: [
      { name: 'LeetCode Guide', href: '/guide' },
      { name: 'Changelog', href: '/changelog' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' }
    ]
  };

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Leetr</h3>
            <p className="text-sm text-muted-foreground">
              Helping developers succeed in technical interviews since 2024.
            </p>
            <div className="flex space-x-4">
              <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} InterviewPrep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;