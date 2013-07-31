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

	my @weekDays = ("sun", "mon", "tue", "wed", "thu", "fri", "sat");
	my @months   = ('jan', 'feb', 'mar', 'apr', 'may', 'jun',
              		'jul', 'aug', 'sep', 'oct', 'nov', 'dec');

	my $holidayDays;
	my $holidays;
	my $workdays;
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
			if (!($day=~/sat|sun/) || ($holidayName)) { $workdays->{$theYear}->{$nice_month}->{$dayNum} = $day; }

      			$cal->{$nice_month}->{$dayNum}={ 
				'day' 	  => $day,
				'workday' => ($day =~ /sat|sun/) || ($holidayName)  ? 0 : 1,
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
	
 	my $json_holidays = $coder->encode ($holidays);
 	my $json_workdays = $coder->encode ($workdays);
	chomp($json_holidays);
	chomp($json_workdays);

	printf("var holidays = %s;\n\n",$json_holidays);
	printf("var workdays = %s;\n\n",$json_workdays);

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

   my %daysInMonth = ("jan" => 31, "feb" => 28, "mar" => 31, "apr" => 30,
                   "may" => 31, "jun" => 30, "jul" => 31, "aug" => 31,
                   "sep" => 30, "oct" => 31, "nov" => 30, "dec" => 31);

   if (((($theYear % 4) == 0) && (($theYear % 100) != 0)) || ($theYear % 400) == 0) {
      $daysInMonth{'feb'} = 29;
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
