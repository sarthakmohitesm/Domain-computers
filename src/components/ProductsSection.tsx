import { Laptop, Smartphone, Monitor, Headphones, Watch, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

const products = [
  { icon: Laptop, name: 'Laptops', count: '150+ Models' },
  { icon: Smartphone, name: 'Smartphones', count: '200+ Devices' },
  { icon: Monitor, name: 'Desktops', count: '80+ Builds' },
  { icon: Headphones, name: 'Audio', count: '100+ Products' },
  { icon: Watch, name: 'Wearables', count: '50+ Options' },
  { icon: Camera, name: 'Accessories', count: '300+ Items' },
];

export const ProductsSection = () => {
  return (
    <section id="products" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-display text-sm tracking-[0.3em] uppercase">Our Products</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
              Premium <span className="text-gradient">Electronics</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Discover our extensive collection of cutting-edge electronics from the world's leading brands. 
              Whether you're looking for the latest smartphone, a powerful laptop, or professional audio equipment, 
              we have it all.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {products.map((product) => (
                <div
                  key={product.name}
                  className="p-4 rounded-xl glass hover-glow cursor-pointer group transition-all duration-300 hover:border-primary/50"
                >
                  <product.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-foreground">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.count}</div>
                </div>
              ))}
            </div>

            <Button variant="glow" size="lg" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
              Browse All Products
            </Button>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square rounded-3xl glass p-8 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-glow-secondary/10 rounded-full blur-3xl" />
              
              {/* Center content */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center animate-float">
                    <Monitor className="w-16 h-16 text-primary" />
                  </div>
                  <div className="font-display text-2xl font-bold text-foreground mb-2">
                    Latest Tech
                  </div>
                  <div className="text-muted-foreground">
                    Always in stock
                  </div>
                </div>
              </div>

              {/* Floating icons */}
              <div className="absolute top-12 left-12 p-3 rounded-xl glass animate-float" style={{ animationDelay: '0.5s' }}>
                <Laptop className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute top-24 right-12 p-3 rounded-xl glass animate-float" style={{ animationDelay: '1s' }}>
                <Smartphone className="w-6 h-6 text-glow-secondary" />
              </div>
              <div className="absolute bottom-24 left-16 p-3 rounded-xl glass animate-float" style={{ animationDelay: '1.5s' }}>
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute bottom-12 right-16 p-3 rounded-xl glass animate-float" style={{ animationDelay: '2s' }}>
                <Watch className="w-6 h-6 text-glow-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
