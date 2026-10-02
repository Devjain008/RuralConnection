const productRepository = require('../repositories/product.repository');
const jobRepository = require('../repositories/job.repository');
const businessRepository = require('../repositories/business.repository');
const orderRepository = require('../repositories/order.repository');

const tools = {
    async searchProducts(keyword, limit = 5) {
        const result = await productRepository.findWithFilters({ keyword, limit });
        return result.products.map(p => ({
            name: p.name,
            price: p.price,
            wholesalePrice: p.wholesalePrice,
            minimumWholesaleQuantity: p.minimumWholesaleQuantity,
            stock: p.stock,
            purchaseType: p.purchaseType
        }));
    },

    async searchJobs(search, limit = 5) {
        const result = await jobRepository.findWithFilters({ search, limit });
        return result.jobs.map(j => ({
            title: j.title,
            jobType: j.jobType,
            salary: j.salary,
            city: j.location?.city,
            businessName: j.business?.businessName
        }));
    },

    async findBusinesses(search, limit = 5) {
        const result = await businessRepository.findAll({ search, limit });
        return (result.businesses || []).map(b => ({
            name: b.businessName,
            category: b.category,
            city: b.address?.city,
            phone: b.phone
        }));
    },

    async getRecentOrders(userId, limit = 3) {
        const orders = await orderRepository.findByUser(userId);
        return (orders || []).slice(0, limit).map(o => ({
            orderId: o._id,
            total: o.total,
            status: o.orderStatus,
            items: o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
        }));
    }
};

module.exports = tools;
