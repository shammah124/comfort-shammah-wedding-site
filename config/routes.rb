Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resource :session, only: [:show, :create, :destroy]
    resources :rsvps, only: [:create, :index]
    resource :site_settings, only: [:show, :update]
    post "site_settings/media_upload", to: "site_settings#media_upload"
    delete "site_settings/media_upload", to: "site_settings#media_delete"
    post "site_settings/programme_upload", to: "site_settings#programme_upload"
    delete "site_settings/programme_upload", to: "site_settings#programme_delete"
    resources :live_updates, only: [:index, :create, :destroy]
    resource :support_detail, only: [:show, :update]
    resources :planning_contacts, only: [:index, :create, :update, :destroy]
  end

  get "programmes/church", to: "downloads#church_programme_view", as: :church_programme_view
  get "programmes/reception", to: "downloads#reception_programme_view", as: :reception_programme_view
  get "downloads/church-programme", to: "downloads#church_programme"
  get "downloads/reception-programme", to: "downloads#reception_programme"
  get "downloads/media", to: "downloads#media"
  get "manifest.json", to: "pwa#manifest", as: :pwa_manifest, defaults: { format: :json }
  get "service-worker.js", to: "pwa#service_worker", as: :service_worker, defaults: { format: :js }

  root "application#index"
  get "*path", to: "application#index", constraints: ->(req) { !req.xhr? && req.format.html? }
end
