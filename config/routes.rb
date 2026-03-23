require "sidekiq/web"

Rails.application.routes.draw do
  namespace :api do
    get "branches", to: "branches#index"
    get "branches/:id", to: "branches#show"
    get "packages/:id", to: "packages#show"
    get "packages", to: "packages#index"
    get "events", to: "events#index"
    get "events/:id", to: "events#show"
    get "courts", to: "courts#index"
    get "availability", to: "availability#index"
    post "bookings", to: "bookings#create"
    post "package_requests", to: "package_requests#create"
    get  "reviews",  to: "reviews#index"
    post "reviews",  to: "reviews#create"
    get "settings", to: "settings#show"
    post "branches/:branch_id/promo_codes/validate", to: "promo_codes#validate"

    namespace :admin do
      post "login", to: "sessions#create"
      delete "logout", to: "sessions#destroy"

      resources :branches do
        resources :promo_codes, only: [:index, :create, :show, :update, :destroy] do
          collection { post :validate }
        end
      end
      resources :courts do
        resources :perks, only: [:index, :create, :update, :destroy] do
          collection { patch :reorder }
        end
        resources :hourly_rates, only: [:index, :create, :update, :destroy]
      end
      resources :packages
      resources :package_requests, only: %i[index show update]
      resources :events
      resources :bookings, only: %i[index show update]
      resources :blocked_slots, only: %i[index show create update destroy]
      resource :settings, only: %i[show create update]
      resources :admins, only: %i[index create update destroy]
      get "statistics", to: "statistics#index"
      get "ratings",    to: "ratings#index"
      resources :reviews, only: %i[index destroy]
    end
  end

  mount Sidekiq::Web => "/sidekiq" if Rails.env.development?

  get "up" => "rails/health#show", as: :rails_health_check
end
