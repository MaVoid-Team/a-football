module Api
  module Admin
    class StatisticsController < BaseController
      skip_after_action :verify_authorized
      skip_after_action :verify_policy_scoped

      def index
        scope = if current_admin.super_admin?
          Booking.all
        else
          Booking.where(branch_id: current_admin.branch_id)
        end

        days_in_period = (params[:days] || 30).to_i
        start_date = days_in_period.days.ago.to_date

        revenue = Analytics::RevenueQuery.new(scope: scope, params: params).call

        period_scope = scope.where("date >= ?", start_date)
        bookings_per_court = Analytics::BookingsPerCourtQuery.new(scope: period_scope).call
        total_confirmed = period_scope.confirmed.count

        courts_scope = if current_admin.super_admin?
          Court.all
        else
          Court.where(branch_id: current_admin.branch_id)
        end
        total_courts = courts_scope.active.count

        setting = Setting.find_by(branch_id: current_admin.branch_id)
        opening = setting&.opening_hour || 8
        closing = setting&.closing_hour || 23
        total_slots_per_court = closing - opening

        total_possible = total_courts * total_slots_per_court * days_in_period
        occupancy_rate = total_possible > 0 ? (total_confirmed.to_f / total_possible * 100).round(2) : 0

        render json: {
          total_revenue: revenue,
          total_confirmed_bookings: total_confirmed,
          bookings_per_court: bookings_per_court,
          occupancy_rate_percent: occupancy_rate
        }, status: :ok
      end
    end
  end
end
