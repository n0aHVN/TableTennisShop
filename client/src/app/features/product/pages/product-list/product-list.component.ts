import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IProduct, IProductFilters, ProductCategory, ProductStatus, ProductType } from '@models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  readonly Math = Math;
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  filterForm!: FormGroup;
  loading = false;
  totalProducts = 0;
  currentPage = 1;
  pageSize = 12;

  categories = Object.values(ProductCategory);
  types = Object.values(ProductType);

  // Mock data for demonstration
  private mockProducts: IProduct[] = [
    {
      id: '1',
      name: 'Professional Carbon Racket',
      description: 'High-quality carbon racket for professional players',
      price: 299.99,
      stock: 15,
      image: 'https://via.placeholder.com/300x300?text=Racket+1',
      category: ProductCategory.RACKETS,
      type: ProductType.PROFESSIONAL,
      status: ProductStatus.AVAILABLE,
      rating: 4.8,
      reviewCount: 120,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Premium Table Tennis Balls',
      description: 'Official 40mm ABS plastic balls set of 12',
      price: 24.99,
      stock: 50,
      image: 'https://via.placeholder.com/300x300?text=Balls+1',
      category: ProductCategory.BALLS,
      type: ProductType.PROFESSIONAL,
      status: ProductStatus.AVAILABLE,
      rating: 4.6,
      reviewCount: 89,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Indoor Table Tennis Table',
      description: 'Regulation size tournament table',
      price: 1299.99,
      stock: 5,
      image: 'https://via.placeholder.com/300x300?text=Table+1',
      category: ProductCategory.TABLES,
      type: ProductType.PROFESSIONAL,
      status: ProductStatus.AVAILABLE,
      rating: 4.9,
      reviewCount: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Professional Table Tennis Shoes',
      description: 'Lightweight and comfortable court shoes',
      price: 129.99,
      stock: 30,
      image: 'https://via.placeholder.com/300x300?text=Shoes+1',
      category: ProductCategory.SHOES,
      type: ProductType.PROFESSIONAL,
      status: ProductStatus.AVAILABLE,
      rating: 4.5,
      reviewCount: 67,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      name: 'Intermediate Racket Set',
      description: 'Great for beginners transitioning to intermediate level',
      price: 89.99,
      stock: 40,
      image: 'https://via.placeholder.com/300x300?text=Racket+2',
      category: ProductCategory.RACKETS,
      type: ProductType.INTERMEDIATE,
      status: ProductStatus.AVAILABLE,
      rating: 4.3,
      reviewCount: 156,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '6',
      name: 'Beginner Racket',
      description: 'Perfect for starting your table tennis journey',
      price: 39.99,
      stock: 60,
      image: 'https://via.placeholder.com/300x300?text=Racket+3',
      category: ProductCategory.RACKETS,
      type: ProductType.BEGINNER,
      status: ProductStatus.AVAILABLE,
      rating: 4.1,
      reviewCount: 234,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '7',
      name: 'Professional Shirt',
      description: 'High-performance athletic shirt',
      price: 59.99,
      stock: 25,
      image: 'https://via.placeholder.com/300x300?text=Shirt+1',
      category: ProductCategory.CLOTHING,
      type: ProductType.PROFESSIONAL,
      status: ProductStatus.AVAILABLE,
      rating: 4.4,
      reviewCount: 78,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '8',
      name: 'Table Tennis Net',
      description: 'Portable net for table tennis',
      price: 34.99,
      stock: 35,
      image: 'https://via.placeholder.com/300x300?text=Accessories+1',
      category: ProductCategory.ACCESSORIES,
      type: ProductType.BEGINNER,
      status: ProductStatus.AVAILABLE,
      rating: 4.2,
      reviewCount: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();
  }

  private initializeForm(): void {
    this.filterForm = this.formBuilder.group({
      search: [''],
      category: [''],
      type: [''],
      minPrice: [''],
      maxPrice: [''],
      sortBy: ['name'],
      sortOrder: ['asc']
    });
  }

  loadProducts(): void {
    this.loading = true;
    // TODO: Call product service to fetch products
    // For now, using mock data
    setTimeout(() => {
      this.products = this.mockProducts;
      this.totalProducts = this.mockProducts.length;
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.products];
    const filters = this.filterForm.value;

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(searchTerm) ||
             p.description.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(p => p.type === filters.type);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aRaw = a[filters.sortBy as keyof IProduct] ?? 0;
        const bRaw = b[filters.sortBy as keyof IProduct] ?? 0;
        let aVal = aRaw;
        let bVal = bRaw;

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }

        if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredProducts = filtered;
    this.totalProducts = filtered.length;
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  addToCart(product: IProduct): void {
    // TODO: Implement add to cart logic
    console.log('Added to cart:', product);
  }

  viewProductDetails(product: IProduct): void {
    // TODO: Navigate to product details page
    console.log('View details:', product);
  }

  get displayedProducts(): IProduct[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
