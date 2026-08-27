import sys

file = 'src/components/admin/quotes/AdminQuotesList.tsx'
content = open(file).read()

# Mobile View Update
old_content1 = '''                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-brown">{quote.orderCode}</p>
                        <span className="text-xs text-sage">{formatDate(quote.createdAt)}</span>
                      </div>'''

new_content1 = '''                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-brown">{quote.orderCode}</p>
                          {quote.deliveryType === 'Delivery' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#c8a96b]/10 text-[#c8a96b] px-1.5 py-0.5 rounded-sm border border-[#c8a96b]/20">Delivery</span>
                          )}
                          {quote.deliveryType === 'MeetingPoint' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#71a37c]/10 text-[#71a37c] px-1.5 py-0.5 rounded-sm border border-[#71a37c]/20">Punto de Enc.</span>
                          )}
                          {quote.deliveryType === 'NationalShipping' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#d38b8b]/10 text-[#d38b8b] px-1.5 py-0.5 rounded-sm border border-[#d38b8b]/20">Nacional</span>
                          )}
                        </div>
                        <span className="text-xs text-sage">{formatDate(quote.createdAt)}</span>
                      </div>'''

# Desktop View Update
old_content2 = '''                      <tr key={quote.quoteId} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4 font-medium">{quote.orderCode}</td>
                        <td className="px-6 py-4">'''

new_content2 = '''                      <tr key={quote.quoteId} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-brown mb-1">{quote.orderCode}</div>
                          {quote.deliveryType === 'Delivery' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#c8a96b]/10 text-[#c8a96b] px-2 py-0.5 rounded-sm border border-[#c8a96b]/20">Delivery Local</span>
                          )}
                          {quote.deliveryType === 'MeetingPoint' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#71a37c]/10 text-[#71a37c] px-2 py-0.5 rounded-sm border border-[#71a37c]/20">Punto de Encuentro</span>
                          )}
                          {quote.deliveryType === 'NationalShipping' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#d38b8b]/10 text-[#d38b8b] px-2 py-0.5 rounded-sm border border-[#d38b8b]/20">Envío Nacional</span>
                          )}
                        </td>
                        <td className="px-6 py-4">'''

content = content.replace(old_content1, new_content1).replace(old_content2, new_content2)

open(file, 'w').write(content)
