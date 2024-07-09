<?php
session_start();
if ($_SESSION['email'] == true) {
} else {
  header('location:seeker_signin.php');
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <title>JobPortal</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <script src="https://code.iconify.design/1/1.0.7/iconify.min.js"></script>
  <link rel="stylesheet" href="css/style.css">
  </link>
  <link rel="stylesheet" href="css/seeker.css">
  </link>
  <link rel="stylesheet" type="text/css" href="fonts/Linearicons-Free-v1.0.0/icon-font.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
</head>

<style>
  .button {
    background-color: #4CAF50;
    /* Green */
    border: none;
    color: white;
    padding: 10px 25px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    font-family: Raleway-SemiBold;
  }

  #wrap {
    height: 800px;
  }
</style>

<header>
  <script>
    /* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
    function myFunction() {
      document.getElementById("myDropdown").classList.toggle("show");
    }

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(e) {
      if (!e.target.matches('.dropbtn')) {
        var myDropdown = document.getElementById("myDropdown");
        if (myDropdown.classList.contains('show')) {
          myDropdown.classList.remove('show');
        }
      }
    }
  </script>
  <div id='wrap'>
    <br><br>
    <div class="topnav">
      <div class="topnav-left">
        <a href="seeker_dashboard.php" class="active">Job Portal</a>
      </div>
      <div class="navbar" style="display: inline-block;">
        <div>
          <a href="my_applications.php" style="background-color: #1963E4; border-radius: 10px; height: 31px; vertical-align: bottom;">My Applications</a>
        </div>
        <nobr>
          <div class="profile_dropdown">
            <?php
            $email = $_SESSION['email'];
            include("connection/db.php");
            $query = mysqli_query($conn, "select id,email,fname,profile_img from job_seeker where email='$email';");
            $row = mysqli_fetch_array($query)
            ?>
            <div class="dropdown">
              <a class="dropbtn" onclick="myFunction()"><img src="<?php echo $row['profile_img']; ?>" onerror="this.onerror=null; this.src='img/profile.png'" class="Profile" style="border-radius: 50%; height: 25px; width: 30px; overflow-y: visible; z-index: 1; "></a>
              <div class="dropdown-content" id="myDropdown">
                <a href="seeker_update1.php?id=<?php echo $row['id'] ?>">Edit Profile</a>
                <a href="logout.php"><span class="iconify" data-icon="feather-power" data-inline="false"></span> Logout</a>
              </div>
            </div>
          </div>
      </div>
    </div>

    <div id='main'>
      <br><br><br><br><br>
      <p id='p1'>We have 850,000 great job offers you deserve!</p>
      <h1 id="dream">Your Dream</h1>
      <h1 id="wait">Job is waiting</h1>
    </div>

    <div class="search" id="main1">
      <div class="search_text" id="searchjum" style="text-align: left; padding-left: 27% ">
        <h1 style="font-size: 30px;">Search for Jobs</h1>

        <form class="form-inline" id="homesearch">
          <input type="text" class="form-control" size="50" placeholder="Enter Job Title" name="keyword" id="keyword" autocomplete="nppe"> <br><br>
          <button type="button" onclick="search()" class="btn " style="background-color: #1963E4; border-radius: 10px; padding: 8px; margin-left: 160px"><span class="fa fa-search"></span> Search</button>&emsp;
          <button type="button" onclick="reset_page()" class="btn " style="background-color: #90ee90; border-radius: 10px; padding: 9px;"><span class="fa fa-repeat"></span> Reset</button>
        </form>
      </div>
    </div>
  </div>
</header>

<body id="bod">
  <div id="posts">
    <h1>Job Posts for you</h1>
    <img id="not-found" src="img/not-found.jpg" width="650px" height="500px" style="margin-left: 200px; display:none">
    <?php
    include("connection/db.php");
    $query = mysqli_query($conn, "select * from jobs");
    $user_email = $_SESSION['email'];
    $query2 = mysqli_query($conn, "select id from job_seeker where email='$user_email'");
    $user_id = mysqli_fetch_array($query2);

    while ($row = mysqli_fetch_array($query)) {
      $creator = $row['creator_email'];
      $query1 = mysqli_query($conn, "select photo from company where email='$creator'");
      $path = mysqli_fetch_array($query1);
      $job_id = $row['job_id'];
      $query3 = mysqli_query($conn, "select * from applicant where user_id='$user_id[0]' and job_post_id='$job_id'");

      if ($query3) {
        if (mysqli_num_rows($query3) > 0) {
        } else {
    ?>
          <div class="post-card">
            <img id="image" src="<?php echo $path[0] ?>">
            <div class="container">
              <h4 class="job-title"><b><?php echo $row['job_title'] ?></b></h4>
              <p><?php echo $row['description'] ?></p>
              <p>Openings: <?php echo $row['openings'] ?></p>
              <p>Salary: <?php echo $row['salary'] ?></p>
              <a class="button" onclick="alert('Apply for this post with your current resume?')" href="apply.php?job-id=<?php echo $job_id ?>&user-id=<?php echo $user_id[0] ?>">APPLY</a> <br><br>
            </div>
          </div>
    <?php  }
      }
    } ?>
  </div>

</body>
</html>





<script>
  function search() {
    let input = document.getElementById('keyword').value
    input = input.toLowerCase()
    let job_titles = document.getElementsByClassName('job-title');
    let postcards = document.getElementsByClassName('post-card');

    let count = 0;
    for (i = 0; i < job_titles.length; i++) {
      if (!job_titles[i].innerHTML.toLowerCase().includes(input)) {
        postcards[i].style.display = "none";
        count += 1
      } else {
        postcards[i].style.display = "block";
      }
    }

    if (count == postcards.length) {
      document.getElementById('not-found').style.display = 'block';
    }
  }

  function reset_page() {
    location.reload();
    console.log('reload');
  }
</script>