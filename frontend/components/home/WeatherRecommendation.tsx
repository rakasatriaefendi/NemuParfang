"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Thermometer, CloudSnow, Sun, Moon } from 'lucide-react';
import { Container } from '../shared/Container';
import { SectionHeader } from '../shared/SectionHeader';

export const WeatherRecommendation = () => {
  const recommendations = [
    {
      id: 'morning-fresh',
      title: 'Morning Fresh',
      desc: 'Crisp, uplifting, citrus start.',
      img: '/assets/occasion-casual.png',
      icon: <Sun className="w-6 h-6 text-parfang-accent" />,
      tag: 'Morning / Warm Day'
    },
    {
      id: 'night-elegant',
      title: 'Night Elegant',
      desc: 'Deep, mysterious, formal wear.',
      img: '/assets/weather-cool-night.png',
      icon: <Moon className="w-6 h-6 text-parfang-accent" />,
      tag: 'Evening / Cool Night'
    },
    {
      id: 'citrus-breeze',
      title: 'High Heat',
      desc: 'Aquatic and citrus focused.',
      img: '/assets/occasion-hot-water.png',
      icon: <Thermometer className="w-6 h-6 text-parfang-accent" />,
      tag: 'Hot Summer / Active'
    },
    {
      id: 'sandalwood-sublime',
      title: 'Winter Comfort',
      desc: 'Warm spices and heavy woods.',
      img: '/assets/occasion-office.png',
      icon: <CloudSnow className="w-6 h-6 text-parfang-accent" />,
      tag: 'Cold Weather / Fall'
    }
  ];

  return (
    <section className="bg-[#fcfcfa] border-y border-parfang-border/30 py-16 md:py-24 mb-16 md:mb-24">
      <Container>
        <SectionHeader
          title="Scents for the Moment"
          subtitle="Situational"
          align="left"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((rec) => (
            <Link
              key={rec.id}
              href={`/perfume/${rec.id}`}
              className="scent-card rounded-xl overflow-hidden group cursor-pointer bg-parfang-surface flex flex-col h-full shadow-sm hover:shadow-md"
            >
              {/* Image box */}
              <div className="relative h-60 w-full overflow-hidden bg-parfang-bg">
                <Image
                  src={rec.img}
                  alt={rec.title}
                  fill
                  sizes="(max-w-768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full z-10 shadow-sm">
                  {rec.icon}
                </div>
              </div>

              {/* Text box */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider text-parfang-accent mb-2 block font-semibold">
                    {rec.tag}
                  </span>
                  <h3 className="font-headline-sm text-lg text-parfang-text mb-1 leading-snug group-hover:text-parfang-accent transition-colors">
                    {rec.title}
                  </h3>
                  <p className="font-body text-xs text-parfang-muted mb-6 leading-relaxed">
                    {rec.desc}
                  </p>
                </div>
                
                <div className="flex items-center text-parfang-accent font-nav text-[10px] uppercase tracking-widest group-hover:tracking-[0.12em] transition-all duration-300 font-semibold">
                  Explore Details <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
export default WeatherRecommendation;
