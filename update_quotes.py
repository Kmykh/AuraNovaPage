import sys

file = 'src/components/admin/quotes/AdminQuoteDetail.tsx'
content = open(file).read()

# Replace the Shipping Cost input rendering logic
old_content1 = '''              <div className={order?.isCustomOrder ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-brown mb-2">
                  Costo de Envío Nacional (S/) <span className="text-rose">*</span>
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      disabled={isPending}
                      className="w-full px-4 py-3 bg-[#FAFAFA] border border-sage/30 rounded-xl focus:ring-1 focus:ring-gold outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  {!order?.isCustomOrder && (
                    <div className="w-1/3">
                      <div className="h-12 px-4 flex items-center bg-cream/30 border border-sage/10 rounded-xl text-brown font-semibold text-sm">
                        {quote.shippingCost !== null ? formatCurrency(quote.shippingCost) : 'Ninguno'}
                      </div>
                    </div>
                  )}
                </div>
              </div>'''

new_content1 = '''              {order?.deliveryType === 'NationalShipping' ? (
                <div className={order?.isCustomOrder ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Costo de Envío Nacional (S/) <span className="text-rose">*</span>
                  </label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                        disabled={isPending}
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-sage/30 rounded-xl focus:ring-1 focus:ring-gold outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    {!order?.isCustomOrder && (
                      <div className="w-1/3">
                        <div className="h-12 px-4 flex items-center bg-cream/30 border border-sage/10 rounded-xl text-brown font-semibold text-sm">
                          {quote.shippingCost !== null ? formatCurrency(quote.shippingCost) : 'Ninguno'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={order?.isCustomOrder ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Costo de Envío ({order?.deliveryType === 'Delivery' ? 'Delivery Local' : 'Punto de Encuentro'})
                  </label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <div className="h-12 w-full px-4 flex items-center bg-[#FAFAFA] border border-sage/30 rounded-xl text-brown opacity-70">
                        {order?.deliveryCost !== null && order?.deliveryCost !== undefined ? formatCurrency(order.deliveryCost) : 'S/ 0.00'}
                      </div>
                      <p className="text-xs text-sage mt-2">
                        El costo de envío ya fue calculado automáticamente al crear el pedido.
                      </p>
                    </div>
                  </div>
                </div>
              )}'''

# Replace the Order Summary header to include Delivery Type badge
old_content2 = '''        <div className="p-6 border-b border-sage/10 bg-[#FAFAFA]">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-2 text-brown font-serif font-semibold text-lg">
              <Package size={20} className="text-gold" />
              <h3>Resumen del Pedido</h3>
            </div>
            <Link href={`/admin/pedidos/${quote.orderId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Ver detalle completo
              </Button>
            </Link>
          </div>
        </div>'''

new_content2 = '''        <div className="p-6 border-b border-sage/10 bg-[#FAFAFA]">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-3 text-brown font-serif font-semibold text-lg">
              <Package size={20} className="text-gold" />
              <h3>Resumen del Pedido</h3>
              
              {order?.deliveryType === 'Delivery' && (
                <span className="ml-2 text-[10px] uppercase tracking-wider font-bold bg-[#c8a96b]/10 text-[#c8a96b] px-3 py-1 rounded-full border border-[#c8a96b]/20">
                  Delivery Local
                </span>
              )}
              {order?.deliveryType === 'MeetingPoint' && (
                <span className="ml-2 text-[10px] uppercase tracking-wider font-bold bg-[#71a37c]/10 text-[#71a37c] px-3 py-1 rounded-full border border-[#71a37c]/20">
                  Punto de Encuentro
                </span>
              )}
              {order?.deliveryType === 'NationalShipping' && (
                <span className="ml-2 text-[10px] uppercase tracking-wider font-bold bg-[#d38b8b]/10 text-[#d38b8b] px-3 py-1 rounded-full border border-[#d38b8b]/20">
                  Envío Nacional
                </span>
              )}
            </div>
            <Link href={`/admin/pedidos/${quote.orderId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Ver detalle completo
              </Button>
            </Link>
          </div>
        </div>'''

content = content.replace(old_content1, new_content1).replace(old_content2, new_content2)

# Fix shippingCost logic in handleSubmit
old_content3 = '''    const numericShippingCost = parseFloat(shippingCost);
    const numericCustomCost = order?.isCustomOrder ? parseFloat(customizationCost) : undefined;
    
    if (isNaN(numericShippingCost) || numericShippingCost < 0) {
      setErrorMsg("Ingresa un costo de envío válido.");
      return;
    }'''

new_content3 = '''    // If not national shipping, we send 0 and backend will preserve the original delivery cost.
    const numericShippingCost = order?.deliveryType === 'NationalShipping' ? parseFloat(shippingCost) : 0;
    const numericCustomCost = order?.isCustomOrder ? parseFloat(customizationCost) : undefined;
    
    if (order?.deliveryType === 'NationalShipping' && (isNaN(numericShippingCost) || numericShippingCost < 0)) {
      setErrorMsg("Ingresa un costo de envío válido.");
      return;
    }'''

content = content.replace(old_content3, new_content3)

open(file, 'w').write(content)
