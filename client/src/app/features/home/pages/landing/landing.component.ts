import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class LandingComponent {
  features = [
    {
      icon: '🎾',
      title: 'Premium Equipment',
      description: 'Professional-grade table tennis equipment for all skill levels'
    },
    {
      icon: '🚚',
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to your doorstep'
    },
    {
      icon: '💯',
      title: 'Quality Guaranteed',
      description: 'All products are tested and verified for quality'
    },
    {
      icon: '🤝',
      title: 'Expert Support',
      description: 'Get advice from table tennis professionals'
    }
  ];

  products = [
    {
      name: 'Professional Rackets',
      image: 'https://via.placeholder.com/300x300?text=Rackets',
      price: 'From $99'
    },
    {
      name: 'Tournament Tables',
      image: 'https://via.placeholder.com/300x300?text=Tables',
      price: 'From $1,299'
    },
    {
      name: 'Premium Balls',
      image: 'https://via.placeholder.com/300x300?text=Balls',
      price: 'From $24'
    },
    {
      name: 'Sportswear',
      image: 'https://via.placeholder.com/300x300?text=Clothing',
      price: 'From $49'
    }
  ];
}
