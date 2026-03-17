puts "Seeding database..."

branch1 = Branch.find_or_create_by!(name: "Downtown Sports Center") do |b|
  b.address = "123 Main Street, Downtown"
  b.timezone = "Africa/Cairo"
  b.active = true
end

branch2 = Branch.find_or_create_by!(name: "Uptown Athletic Club") do |b|
  b.address = "456 Park Avenue, Uptown"
  b.timezone = "Africa/Cairo"
  b.active = true
end

Setting.find_or_create_by!(branch: branch1) do |s|
  s.whatsapp_number = "201234567890"
  s.contact_email = "downtown@courtmgmt.com"
  s.contact_phone = "+20-123-456-7890"
  s.opening_hour = 8
  s.closing_hour = 23
end

Setting.find_or_create_by!(branch: branch2) do |s|
  s.whatsapp_number = "209876543210"
  s.contact_email = "uptown@courtmgmt.com"
  s.contact_phone = "+20-987-654-3210"
  s.opening_hour = 8
  s.closing_hour = 23
end

super_admin = Admin.find_or_create_by!(email: "superadmin@courtmgmt.com") do |a|
  a.password = "password123"
  a.password_confirmation = "password123"
  a.role = :super_admin
  a.branch = nil
end

branch_admin1 = Admin.find_or_create_by!(email: "admin.downtown@courtmgmt.com") do |a|
  a.password = "password123"
  a.password_confirmation = "password123"
  a.role = :branch_admin
  a.branch = branch1
end

branch_admin2 = Admin.find_or_create_by!(email: "admin.uptown@courtmgmt.com") do |a|
  a.password = "password123"
  a.password_confirmation = "password123"
  a.role = :branch_admin
  a.branch = branch2
end

court1a = Court.find_or_create_by!(branch: branch1, name: "Court A") do |c|
  c.price_per_hour = 150.00
  c.active = true
end
court1b = Court.find_or_create_by!(branch: branch1, name: "Court B") do |c|
  c.price_per_hour = 200.00
  c.active = true
end
court2a = Court.find_or_create_by!(branch: branch2, name: "Court Alpha") do |c|
  c.price_per_hour = 175.00
  c.active = true
end
court2b = Court.find_or_create_by!(branch: branch2, name: "Court Beta") do |c|
  c.price_per_hour = 225.00
  c.active = true
end

Package.find_or_create_by!(branch: nil, title: "Starter Pack") do |p|
  p.description = "10 hours of court time"
  p.price = 1200.00
end
Package.find_or_create_by!(branch: branch1, title: "Downtown Monthly") do |p|
  p.description = "Unlimited play for one month"
  p.price = 3000.00
end
Package.find_or_create_by!(branch: branch2, title: "Uptown Weekend Pass") do |p|
  p.description = "Weekend access for a month"
  p.price = 1800.00
end

Event.find_or_create_by!(branch: branch1, title: "Summer Padel Tournament") do |e|
  e.description = "Annual summer tournament with prizes"
  e.start_date = 1.month.from_now
  e.participation_price = 250.00
  e.max_participants = 32
end

Event.find_or_create_by!(branch: branch2, title: "Beginners Workshop") do |e|
  e.description = "Learn the basics of padel in a fun environment"
  e.start_date = 2.weeks.from_now
  e.participation_price = 100.00
  e.max_participants = 16
end

tomorrow = Date.tomorrow
Booking.find_or_create_by!(court: court1a, date: tomorrow, start_time: "10:00") do |b|
  b.branch = branch1
  b.user_name = "Ahmed Hassan"
  b.user_phone = "+201001234567"
  b.end_time = "11:00"
  b.hours = 1
  b.total_price = 150.00
  b.status = :confirmed
  b.payment_status = :paid
end

Booking.find_or_create_by!(court: court1a, date: tomorrow, start_time: "14:00") do |b|
  b.branch = branch1
  b.user_name = "Mohamed Ali"
  b.user_phone = "+201009876543"
  b.end_time = "16:00"
  b.hours = 2
  b.total_price = 300.00
  b.status = :confirmed
  b.payment_status = :pending
end

BlockedSlot.find_or_create_by!(court: court1b, date: tomorrow, start_time: "08:00") do |s|
  s.branch = branch1
  s.end_time = "10:00"
  s.reason = "Maintenance"
end

puts "Seeding complete!"
puts "  Branches: #{Branch.count}"
puts "  Admins: #{Admin.count}"
puts "  Courts: #{Court.count}"
puts "  Packages: #{Package.count}"
puts "  Events: #{Event.count}"
puts "  Bookings: #{Booking.count}"
puts "  Blocked Slots: #{BlockedSlot.count}"
puts "  Settings: #{Setting.count}"
puts ""
puts "Super Admin: superadmin@courtmgmt.com / password123"
puts "Branch Admin 1: admin.downtown@courtmgmt.com / password123"
puts "Branch Admin 2: admin.uptown@courtmgmt.com / password123"
