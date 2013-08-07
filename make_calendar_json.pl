#!/usr/bin/perl
use strict;
use Date::Calendar::Profiles qw( $Profiles );
use Date::Calendar;
use Data::Dumper;
use JSON;
  
	# Get inputs from the command-line argument @ARGV

	my $startYear = 2013;
	my $firstYear = 1961;
	
	my $cal_ZA = Date::Calendar->new( $Profiles->{'ZA'});

	my @weekDays = ("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
	my @months   = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');


	my $monthShortLong = {	'Jan' => 'January', 'Feb' => 'February', 'Mar' => 'March', 
				'Apr' => 'April', 'May' => 'May', 'Jun' => 'June',
                        	'Jul' => 'July', 'Aug' => 'August', 'Sep' => 'September',
				'Oct' => 'October', 'Nov' => 'November', 'Dec' => 'December'
	};

	my $monthNum = { 	
				0 => 'Jan', 1 => 'Feb', 2 => 'Mar', 3 => 'Apr', 4 => 'May',
				5 => 'Jun', 6 => 'Jul', 7 => 'Aug', 8 => 'Sep', 9 => 'Oct',
				10 => 'Nov', 11 => 'Dec'
	};
				
	

		
	my $holidayDays;
	my $holidays;
	my $workdays;
	my $months;

	my $cal;

foreach my $theYear ($startYear .. $startYear+5) { 

	my $dateCal = $cal_ZA->year($theYear);
	$holidayDays = $dateCal->{TAGS};

	my $daysInMonth = getDaysInMonth($theYear); 
	my $firstWeekDay = getFirstWeekday($theYear);


	my $weekDayNum = 0;
	my $dayCount = 0;

	for my $month (@months) {

		my $nice_month = ucfirst($month);
   		# Skip to the first day of the week
  		 $weekDayNum = 0;
   		 until ($firstWeekDay == $weekDayNum) { $weekDayNum++; }
   
   		# Continue for the rest of the month

   		for (my $dayNum = 1; $dayNum <= $daysInMonth->{$month}; $dayNum++) {

      			my $day = $weekDays[$weekDayNum];
			my $holidayName = isHoliday($dayCount);
			
			if ($holidayName) { $holidays->{$theYear}->{$nice_month}->{$dayNum} = $holidayName; }
			if (!($day=~/Sat|Sun/i) || ($holidayName)) { $workdays->{$theYear}->{$nice_month}->{$dayNum} = $day; }

      			$cal->{$nice_month}->{$dayNum}={ 
				'day' 	  => $day,
				'workday' => ($day =~ /Sat|Sun/i) || ($holidayName)  ? 0 : 1,
				'holiday' => $holidayName
      			};

      			$weekDayNum++;					# Number representing the day of the week
			$dayCount++;					# Number of days in the year

      			if ($weekDayNum == 7) { $weekDayNum = 0; }
   		}

   		$firstWeekDay = $weekDayNum;  # Continue for next month
   		#if ($month eq 'aug') { print Dumper($cal->{$month}); }

	}
	
	#print Dumper($holidays);

}

	my $coder = JSON::XS->new->ascii->pretty->allow_nonref->canonical;
	
 	my $json_holidays = $coder->encode($holidays); 
 	my $json_workdays = $coder->encode ($workdays);
 	my $json_months   = $coder->encode ($monthShortLong);
 	my $json_monthnum = $coder->encode ($monthNum);

        chomp($json_holidays);
        chomp($json_workdays);
        chomp($json_months);
        chomp($json_monthnum);
	
	printf("var holidays = %s;\n\n",$json_holidays);
	printf("var workdays = %s;\n\n",$json_workdays);
	printf("var months = %s;\n\n",$json_months);
	printf("var month_num = %s;\n\n",$json_monthnum);

sub isHoliday {

	my $dayCount = shift;

	(my $holidayName)  = keys %{$holidayDays->{$dayCount}};
	return($holidayName);
}

sub getDaysInMonth {

   #  -----------------------------------------
   # | Return days in the month as a hashref
   #  -----------------------------------------

   my $theYear = shift;

   my %daysInMonth = (	"Jan" => 31, "Feb" => 28, "Mar" => 31, "Apr" => 30,
                   	"May" => 31, "Jun" => 30, "Jul" => 31, "Aug" => 31,
                   	"Sep" => 30, "Oct" => 31, "Nov" => 30, "Dec" => 31);

   if (((($theYear % 4) == 0) && (($theYear % 100) != 0)) || ($theYear % 400) == 0) {
      $daysInMonth{'Feb'} = 29;
   }

   return(\%daysInMonth);
}


sub getFirstWeekday {

        # Knowing that Jan 1, 1961 is a Sunday,
        #  compute the first week day of the given year

	my $theYear = shift;

        my $yearsDiff = $theYear - $firstYear;
        my $daysDiff = $yearsDiff * 365;

        # Account for leap years
        $daysDiff += int($yearsDiff / 4);

        
        my $firstWeekDay = ($daysDiff + 0) % 7;   # +0 for Sunday
        return($firstWeekDay);
}
