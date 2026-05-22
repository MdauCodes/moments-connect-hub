import { downloadReceiptPdf, downloadDispatchChecklistPdf, downloadOrdersListPdf, downloadCustomerStatementPdf } from '../src/lib/pdf.ts';
import { jsPDF } from 'jspdf';
import fs from 'fs';
jsPDF.prototype.save = function(name){ fs.writeFileSync('/mnt/documents/pdfqa/'+name, Buffer.from(this.output('arraybuffer'))); };
fs.mkdirSync('/mnt/documents/pdfqa',{recursive:true});

downloadReceiptPdf({
  reference:'MP-2026-0421', createdAt:new Date().toISOString(),
  customerName:'Achieng Otieno', customerEmail:'achieng@example.com', customerPhone:'+254 712 345 678',
  shippingAddress:'14 Riverside Drive, Apt 3B', city:'Nairobi', county:'Nairobi',
  subtotal:18400, shippingFee:600, vatAmount:3040, total:22040,
  paymentMethod:'M-Pesa', paymentStatus:'PAID', receiptNumber:'SLR8K2P9XQ', fulfillmentType:'COURIER',
  items:[
    {productName:'Kraft mailer box', size:'M', material:'Kraft 350gsm', finish:'Matte', sku:'MB-M-KRA', quantity:200, unitPrice:65, lineTotal:13000},
    {productName:'Branded thank-you card', size:'A6', material:'Cotton 250gsm', finish:'Letterpress', sku:'TC-A6-COT', quantity:200, unitPrice:27, lineTotal:5400},
  ],
});
downloadDispatchChecklistPdf({
  reference:'MP-2026-0421', customerName:'Achieng Otieno', customerPhone:'+254 712 345 678', city:'Nairobi',
  shippingAddress:'14 Riverside Drive, Apt 3B, Nairobi', trackingNumber:'G4S-77821',
  items:[{name:'Kraft mailer box', size:'M', material:'Kraft 350gsm', qty:200, lineTotal:13000},
    {name:'Branded thank-you card', size:'A6', material:'Cotton 250gsm', qty:200, lineTotal:5400}],
});
const rows = Array.from({length:8}, (_,i)=>({
  reference:`MP-2026-04${20+i}`, customerName:['Achieng Otieno','Brian Kamau','Cynthia Wairimu','Daudi Mwangi'][i%4],
  city:['Nairobi','Mombasa','Kisumu','Nakuru'][i%4], status:['PENDING','IN_PRODUCTION','DISPATCHED','DELIVERED'][i%4],
  paymentStatus:i%3?'PAID':'PENDING', total:12000+i*1500, createdAt:new Date(Date.now()-i*86400000).toISOString(),
  items:[{qty:50+i*10}]}));
downloadOrdersListPdf(rows,{filterLabel:'Last 30 days · All statuses'});
downloadCustomerStatementPdf({name:'Achieng Otieno', email:'achieng@example.com', phone:'+254 712 345 678', city:'Nairobi',
  lifetimeValue:184500, ordersCount:7, averageOrderValue:26357, firstOrderAt:'2025-08-12', lastOrderAt:'2026-05-19'}, rows);
console.log('done');
