# A Football — March 20, 2026

## New Features
- **30-minute booking slots**: You can now book courts in 30-minute intervals instead of full-hour blocks, giving you more flexibility for shorter games and tighter schedules.

## Improvements
- **More precise pricing**: Booking totals are now calculated proportionally for half-hour selections, so you only pay for the exact time you reserve.
- **Smarter hourly rate handling**: Time-based pricing windows now apply correctly to shorter reservations, including 30-minute bookings.
- **Better duration accuracy**: Booking duration is stored with decimal precision (for example, 0.5, 1.5, 2.0 hours) to match real reserved time.

## Bug Fixes
- Fixed availability behavior so occupied 1-hour periods block both underlying 30-minute slots.
- Fixed edge cases where bookings with mixed slot lengths could produce inconsistent totals.

## Breaking Changes
- **No user action required**: This release includes an internal database migration to support decimal booking durations.

## Notes
- Existing deployment flows remain unchanged. No Docker or Docker Compose updates are required for this release.
