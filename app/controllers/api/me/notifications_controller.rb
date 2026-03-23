module Api
  module Me
    class NotificationsController < BaseController
      def index
        notifications = current_user.user_notifications.recent_first
        render json: UserNotificationSerializer.new(paginate(notifications)).serializable_hash, status: :ok
      end

      def update
        notification = current_user.user_notifications.find(params[:id])
        notification.update!(read_at: ActiveModel::Type::Boolean.new.cast(notification_params[:read]) ? Time.current : nil)
        render json: UserNotificationSerializer.new(notification).serializable_hash, status: :ok
      end

      private

      def notification_params
        params.require(:notification).permit(:read)
      end
    end
  end
end
