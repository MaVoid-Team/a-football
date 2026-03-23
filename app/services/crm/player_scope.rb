module Crm
  class PlayerScope
    PlayerEntry = Struct.new(:type, :id, :record, keyword_init: true)

    def initialize(admin:)
      @admin = admin
    end

    def all_entries
      user_entries + guest_entries
    end

    private

    def user_entries
      users = User.all
      users = users.where(id: scoped_ids_for("User")) if branch_admin?
      users.find_each.map { |record| PlayerEntry.new(type: "User", id: record.id, record: record) }
    end

    def guest_entries
      guests = TournamentPlayer.guests_only
      guests = guests.where(id: scoped_ids_for("TournamentPlayer")) if branch_admin?
      guests.find_each.map { |record| PlayerEntry.new(type: "TournamentPlayer", id: record.id, record: record) }
    end

    def scoped_ids_for(player_type)
      ActivityLog.where(branch_id: @admin.branch_id, player_type: player_type).distinct.pluck(:player_id)
    end

    def branch_admin?
      @admin.respond_to?(:branch_admin?) && @admin.branch_admin?
    end
  end
end
