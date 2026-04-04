require "sidekiq/web"

Rails.application.routes.draw do
  namespace :api do
    namespace :auth do
      post "register", to: "registrations#create"
      post "login", to: "sessions#create"
      delete "logout", to: "sessions#destroy"
    end

    namespace :me do
      resource :profile, only: %i[show update], controller: "profiles"
      resources :teams, only: %i[index create update destroy]
      resources :notifications, only: %i[index update]
      resources :bookings, only: %i[index]
      resources :matches, only: %i[index]
      resources :tournaments, only: %i[index show]
    end

    get "branches", to: "branches#index"
    get "branches/:id", to: "branches#show"
    get "packages/:id", to: "packages#show"
    get "packages", to: "packages#index"
    get "events", to: "events#index"
    get "events/:id", to: "events#show"
    resources :tournaments, only: %i[index show] do
      member do
        post :register, to: "tournament_registrations#create"
        post :register_team, to: "tournament_team_registrations#create"
        get :matches, to: "tournaments#matches"
        get :bracket, to: "tournaments#bracket"
        get :participants, to: "tournaments#participants"
      end
    end
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
      resources :tournaments, only: %i[index show create update] do
        member do
          post :start
          post :generate_bracket
          post :auto_schedule
          get :bracket
        end
        resources :registrations, only: %i[index], controller: "tournament_registrations"
        resources :matches, only: %i[index], controller: "tournament_matches"
      end
      resources :registrations, only: %i[update], controller: "tournament_registrations"
      resources :matches, only: [] do
        member do
          patch :schedule, controller: "tournament_matches"
          patch :lock, controller: "tournament_matches"
          patch :score, controller: "tournament_matches"
        end
      end
      resources :bookings, only: %i[index show update destroy] do
        member do
          patch :mark_no_show
        end
        collection do
          delete :batch_destroy
        end
      end
      resources :blocked_slots, only: %i[index show create update destroy]
      resource :settings, only: %i[show create update]
      resources :admins, only: %i[index create update destroy]
      get "statistics", to: "statistics#index"
      get "ratings",    to: "ratings#index"
      resources :reviews, only: %i[index destroy]

      namespace :crm do
        get "dashboard", to: "dashboard#index"
        resources :players, only: %i[index show] do
          member do
            patch :tags, to: "players#update_tags"
          end
        end
        resources :segments, only: %i[index create update] do
          member do
            get :players
          end
        end
        resources :automation_rules, only: %i[index create update]
        resource :scoring_settings, only: %i[show update], controller: "scoring_settings"
        resources :action_items, only: %i[index update] do
          member do
            post :whatsapp_link
          end
          collection do
            post :bulk_whatsapp_links
          end
        end
        resources :message_templates, only: %i[index create update]
        resources :whatsapp_links, only: %i[create]
      end
    end
  end

  mount Sidekiq::Web => "/sidekiq" if Rails.env.development?

  get "up" => "rails/health#show", as: :rails_health_check
end
