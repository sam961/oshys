import React from 'react';
import { motion } from 'framer-motion';
import {
  ScrollReveal,
  StaggerContainer,
  LiquidBackground,
  WaveBackground,
  ParallaxSection,
  ParallaxImage
} from '../components/animations';
import { Section, Card, Button, Skeleton, CardSkeleton, GridSkeleton } from '../components/ui';
import { Sparkles, Wand2, Zap, Award } from 'lucide-react';

/**
 * Demo page showcasing all animation components
 * This page is for demonstration purposes only
 * You can access it by adding a route in App.tsx
 */
export const AnimationsDemo: React.FC = () => {
  const [showSkeletons, setShowSkeletons] = React.useState(false);

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Liquid Background */}
      <Section background="gradient" className="relative overflow-hidden">
        <LiquidBackground />
        <WaveBackground variant="primary" opacity={0.08} />

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
                Animations Showcase
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Experience smooth, professional animations that bring your website to life
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Scroll Reveal Demo */}
      <Section background="white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Scroll Reveal Animations</h2>
          <p className="text-gray-600">Elements animate smoothly as they enter the viewport</p>
        </div>

        <div className="space-y-12">
          <ScrollReveal direction="up">
            <Card className="text-center">
              <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">From Bottom</h3>
              <p className="text-gray-600">Slides up with a fade-in effect</p>
            </Card>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal direction="left">
              <Card className="text-center">
                <Wand2 className="w-12 h-12 text-accent-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">From Right</h3>
                <p className="text-gray-600">Slides from the right side</p>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <Card className="text-center">
                <Zap className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">From Left</h3>
                <p className="text-gray-600">Slides from the left side</p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </Section>

      {/* Stagger Container Demo */}
      <Section background="gray">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Stagger Animations</h2>
          <p className="text-gray-600">Grid items appear in sequence for a dynamic effect</p>
        </div>

        <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{item}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Card {item}</h3>
              <p className="text-gray-600">Animates in sequence with siblings</p>
            </Card>
          ))}
        </StaggerContainer>
      </Section>

      {/* Button Interactions */}
      <Section background="white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Enhanced Buttons</h2>
          <p className="text-gray-600">Smooth hover and press animations</p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="primary" size="lg">
            Primary Button
          </Button>
          <Button variant="secondary" size="lg">
            Secondary Button
          </Button>
          <Button variant="outline" size="lg">
            Outline Button
          </Button>
          <Button variant="ghost" size="lg">
            Ghost Button
          </Button>
        </div>
      </Section>

      {/* Skeleton Screens */}
      <Section background="gradient">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Loading Skeletons</h2>
          <p className="text-gray-600">Beautiful loading states instead of spinners</p>
          <Button
            className="mt-4"
            onClick={() => setShowSkeletons(!showSkeletons)}
          >
            {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
          </Button>
        </div>

        {showSkeletons ? (
          <GridSkeleton count={3} />
        ) : (
          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <div className="h-48 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl mb-4" />
                <h3 className="text-xl font-bold mb-2">Loaded Content {item}</h3>
                <p className="text-gray-600 mb-4">This content has finished loading</p>
                <Button className="w-full">View More</Button>
              </Card>
            ))}
          </StaggerContainer>
        )}
      </Section>

      {/* Wave Backgrounds */}
      <Section background="white" className="relative">
        <WaveBackground variant="secondary" opacity={0.1} />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-4">Wave Background</h2>
          <p className="text-gray-600 mb-8">Animated SVG wave patterns</p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <h3 className="font-bold mb-2">Smooth Animation</h3>
              <p className="text-sm text-gray-600">Waves flow continuously in the background</p>
            </Card>
            <Card>
              <h3 className="font-bold mb-2">Multiple Variants</h3>
              <p className="text-sm text-gray-600">Choose from different color schemes</p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Parallax Demo */}
      <ParallaxSection speed={0.5} className="bg-gray-900 text-white py-32">
        <div className="container mx-auto px-6 text-center">
          <Award className="w-16 h-16 text-accent-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Parallax Scrolling</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            This section moves at a different speed than the rest of the page,
            creating a beautiful depth effect
          </p>
        </div>
      </ParallaxSection>

      {/* Summary */}
      <Section background="gradient">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Enhance Your Site?</h2>
          <p className="text-xl text-gray-700 mb-8">
            All these animations are now active throughout your website,
            creating a professional and engaging user experience.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <h4 className="font-bold text-3xl text-primary-600 mb-2">8+</h4>
              <p className="text-sm text-gray-600">Animation Types</p>
            </Card>
            <Card className="text-center">
              <h4 className="font-bold text-3xl text-accent-600 mb-2">60fps</h4>
              <p className="text-sm text-gray-600">Smooth Performance</p>
            </Card>
            <Card className="text-center">
              <h4 className="font-bold text-3xl text-secondary-600 mb-2">100%</h4>
              <p className="text-sm text-gray-600">Customizable</p>
            </Card>
            <Card className="text-center">
              <h4 className="font-bold text-3xl text-primary-600 mb-2">0ms</h4>
              <p className="text-sm text-gray-600">Impact on Load Time</p>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
};
