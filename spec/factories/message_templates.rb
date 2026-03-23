FactoryBot.define do
  factory :message_template do
    sequence(:name) { |n| "template_#{n}" }
    content { "Hi {name}, we miss you at {club_name}" }
    whatsapp_number { "+201001112223" }
    active { true }
    branch { nil }

    trait :for_branch do
      association :branch
    end

    trait :inactive do
      active { false }
    end
  end
end
