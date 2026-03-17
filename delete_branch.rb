#!/usr/bin/env ruby

require File.expand_path("../config/environment", __FILE__)

begin
  branch = Branch.find(1)
  branch_name = branch.name
  branch.destroy!
  puts "SUCCESS: Branch '#{branch_name}' (ID: 1) deleted successfully"
rescue ActiveRecord::RecordNotFound
  puts "ERROR: Branch with ID 1 not found"
rescue => e
  puts "ERROR: #{e.message}"
end
