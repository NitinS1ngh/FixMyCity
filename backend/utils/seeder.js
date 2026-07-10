const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');

const seedData = async () => {
  try {
    // Ensure the demo citizen's name is kept in sync if the record already exists
    await User.updateOne({ email: 'citizen@fixmycity.gov' }, { name: 'Nitin Singh' });

    // Check if seeding has already run
    const deptCount = await Department.countDocuments();
    if (deptCount > 0) {
      console.log('Database already initialized. Skipping automatic data seeding to preserve user complaints.');
      return;
    }

    // 1. Seed Departments first (with placeholder heads)
    const departmentsData = [
      { name: 'Road Department', code: 'ROAD', description: 'Repairs potholes, street signs, and maintains municipal roads.' },
      { name: 'Water Department', code: 'WATER', description: 'Handles water line leakages, drainage, and municipal water supply issues.' },
      { name: 'Electricity Department', code: 'ELECTRICITY', description: 'Manages street lighting, traffic lights, and public electrical lines.' },
      { name: 'Sanitation Department', code: 'SANITATION', description: 'Collects municipal garbage, cleans sewers, and maintains public toilets.' },
      { name: 'Parks Department', code: 'PARKS', description: 'Maintains municipal public parks, gardens, and clears fallen trees.' },
    ];

    const departments = [];
    for (const dept of departmentsData) {
      let existingDept = await Department.findOne({ code: dept.code });
      if (!existingDept) {
        existingDept = await Department.create(dept);
        console.log(`Seeded Department: ${dept.name}`);
      }
      departments.push(existingDept);
    }

    const deptMap = {};
    departments.forEach(d => {
      deptMap[d.code] = d._id;
    });

    // 2. Clear all users to reset the municipal registry
    console.log('Purging municipal user database...');
    await User.deleteMany({});

    // Seed Admin User
    const adminEmail = 'admin@fixmycity.gov';
    await User.create({
      name: 'Municipal Administrator',
      email: adminEmail,
      password: 'admin123',
      phone: '1234567890',
      role: 'admin',
      status: 'active',
    });
    console.log(`Seeded Admin User: ${adminEmail}`);

    // 3. Seed Employee Users (One dedicated to each of the 6 Prayagraj Wards)
    const employeesData = [
      { name: 'Amit Sharma', email: 'road.emp@fixmycity.gov', password: 'employee123', phone: '9876543210', role: 'employee', department: deptMap['ROAD'], ward: 'Ward 1: Civil Lines' },
      { name: 'Priya Patel', email: 'water.emp@fixmycity.gov', password: 'employee123', phone: '9876543211', role: 'employee', department: deptMap['WATER'], ward: 'Ward 2: Katra' },
      { name: 'Rajesh Verma', email: 'elec.emp@fixmycity.gov', password: 'employee123', phone: '9876543212', role: 'employee', department: deptMap['ELECTRICITY'], ward: 'Ward 3: Georgetown' },
      { name: 'Sunita Rao', email: 'san.emp@fixmycity.gov', password: 'employee123', phone: '9876543213', role: 'employee', department: deptMap['SANITATION'], ward: 'Ward 4: Naini' },
      { name: 'Vikram Singh', email: 'parks.emp@fixmycity.gov', password: 'employee123', phone: '9876543214', role: 'employee', department: deptMap['PARKS'], ward: 'Ward 5: Ashok Nagar' },
      { name: 'Sanjay Dwivedi', email: 'jhalwa.emp@fixmycity.gov', password: 'employee123', phone: '9876543215', role: 'employee', department: deptMap['ROAD'], ward: 'Ward 6: Jhalwa' },
    ];

    const employees = [];
    for (const emp of employeesData) {
      const empExists = await User.create(emp);
      console.log(`Seeded Employee: ${emp.name} for ${emp.ward}`);
      employees.push(empExists);
    }

    // 4. Update Department Heads to point to seeded employees
    const associationMap = [
      { code: 'ROAD', email: 'road.emp@fixmycity.gov' },
      { code: 'WATER', email: 'water.emp@fixmycity.gov' },
      { code: 'ELECTRICITY', email: 'elec.emp@fixmycity.gov' },
      { code: 'SANITATION', email: 'san.emp@fixmycity.gov' },
      { code: 'PARKS', email: 'parks.emp@fixmycity.gov' },
    ];

    for (const assoc of associationMap) {
      const dept = await Department.findOne({ code: assoc.code });
      const emp = await User.findOne({ email: assoc.email });
      if (dept && emp) {
        dept.head = emp._id;
        await dept.save();
        console.log(`Assigned Head of Department for ${dept.code} as ${emp.name}`);
      }
    }

    // 5. Seed Citizen User
    const citizenEmail = 'citizen@fixmycity.gov';
    const citizenUser = await User.create({
      name: 'Nitin Singh',
      email: citizenEmail,
      password: 'citizen123',
      phone: '9988776655',
      role: 'citizen',
      status: 'active',
      ward: 'Ward 1: Civil Lines',
    });
    console.log(`Seeded Citizen User: ${citizenEmail}`);

    // 6. Seed 10+ Complaints for EACH Department (55 complaints total)
    console.log('Clearing old complaints to update with complete municipal dataset...');
    await Complaint.deleteMany({});

    const statuses = ['Pending', 'Assigned', 'Accepted', 'In Progress', 'Resolved', 'Closed'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    
    // Define the exact 6 Wards and matching areas
    const wards = [
      'Ward 1: Civil Lines',
      'Ward 2: Katra',
      'Ward 3: Georgetown',
      'Ward 4: Naini',
      'Ward 5: Ashok Nagar',
      'Ward 6: Jhalwa'
    ];
    const areas = ['Civil Lines', 'Katra', 'Georgetown', 'Naini', 'Ashok Nagar', 'Jhalwa'];

    // Issues list for Roads
    const roadIssues = [
      { title: 'Pothole cluster on MG Road', desc: 'Numerous deep potholes causing traffic jams near Civil Lines crossing.' },
      { title: 'Broken sidewalk curb near Katra Market', desc: 'Sidewalk is broken and blocks pedestrians, pushing people on road.' },
      { title: 'Unmarked speed breaker on Naini Bridge', desc: 'No white paint on speed breaker, causing accidents for bikers at night.' },
      { title: 'Caved-in road surface near Georgetown Post Office', desc: 'Road has sunken by 3 inches, very dangerous near the main lane.' },
      { title: 'Waterlogging on Ashok Nagar road', desc: 'Road gets flooded during light showers due to slope and drain issues.' },
      { title: 'Damaged expansion joint on flyover', desc: 'Expansion joint is making loud metal thuds when cars pass over.' },
      { title: 'Loose gravel on Jhalwa main road', desc: 'Gravel from construction left on road, causing tires to skid.' },
      { title: 'Open trench on sidewalk near Alfred Park', desc: 'Trench dug for cable laying left open for two weeks near main gate.' },
      { title: 'Broken drainage cover on Naini road', desc: 'Manhole cover in middle of lane is cracked, hazard to heavy vehicles.' },
      { title: 'Road division barrier broken near Katra', desc: 'Concrete dividers have shifted into the road path due to a crash.' },
      { title: 'Debris left after road excavation', desc: 'Dirt pile left on road side after water pipeline repairs.' },
    ];

    // Issues list for Water
    const waterIssues = [
      { title: 'Water pipe burst near Katra Sector 6', desc: 'Major main line leakage wasting thousands of liters daily.' },
      { title: 'No municipal water supply in Georgetown Block C', desc: 'Water has not been supplied for the last 3 days in Block C.' },
      { title: 'Low pressure water supply in Civil Lines', desc: 'Water pressure is too low to fill first floor tanks.' },
      { title: 'Muddy water coming from taps in Naini', desc: 'Drinking water is brown and filled with mud particles.' },
      { title: 'Leakage near water meter in Jhalwa', desc: 'Continuous dripping has created moss on the public path.' },
      { title: 'Sewer line leakage near school in Ashok Nagar', desc: 'Foul-smelling sewer water leaking onto school entrance road.' },
      { title: 'Rainwater drain choked near Civil Lines market', desc: 'Drain filled with silt, causing street flooding.' },
      { title: 'Water leakage in public handpump at Katra', desc: 'Valve is damaged, water leaks constantly in the street corner.' },
      { title: 'Drainage blockage in Naini sector 4', desc: 'Toilet outlets backing up due to main line clogging.' },
      { title: 'Open valve chamber causing leak', desc: 'Water valve chamber has broken cap, leaking water on road.' },
      { title: 'Sewer manhole overflowing in Georgetown', desc: 'Raw sewage overflowing on the residential lane near plot 212.' },
    ];

    // Issues list for Electricity
    const electricityIssues = [
      { title: 'Blinking streetlight near Civil Lines', desc: 'Streetlight flashes continuously, disturbing residents.' },
      { title: 'Hanging high-voltage wires on Katra road', desc: 'Dangerously low hanging wire near pedestrian walkway.' },
      { title: 'Electricity transformer spoiling in Naini', desc: 'Sparking sound heard from transformer during peak hours.' },
      { title: 'Feeder pillar door open in Georgetown', desc: 'Live electrical box door is missing, hazard to children.' },
      { title: 'Entire street dark in Ashok Nagar', desc: 'None of the streetlights in Block A are working since Monday.' },
      { title: 'Traffic signal light malfunctioning in Civil Lines', desc: 'Red and green lights showing simultaneously at intersection.' },
      { title: 'Electrical pole leaning dangerously in Jhalwa', desc: 'Wind storm has tilted the steel pole toward a house.' },
      { title: 'Damaged cable join box on pole in Katra', desc: 'Wires are sparking in rain near plots 10-15.' },
      { title: 'Streetlight stays on during daytime in Naini', desc: 'Timer malfunction, wasting municipal energy.' },
      { title: 'Frequent voltage fluctuations in Georgetown', desc: 'Voltage drops frequently, damaging appliances.' },
      { title: 'Open cable joint near Civil Lines bus stop', desc: 'Exposed tape-joint near metal seat at bus stand.' }
    ];

    // Issues list for Sanitation
    const sanitationIssues = [
      { title: 'Garbage dump pile not cleared in Katra', desc: 'Garbage collection truck has not visited in 4 days.' },
      { title: 'Public toilet in unhygienic state in Civil Lines', desc: 'No water supply or cleaning in Sector 7 public toilet.' },
      { title: 'Dead animal on Georgetown street', desc: 'Dead stray animal needs immediate disposal, spreading odor.' },
      { title: 'Commercial waste dumped on Ashok Nagar sidewalk', desc: 'Restaurant dumping kitchen waste on public walk.' },
      { title: 'Dustbins overflowing on Jhalwa main road', desc: 'Green community bins are full, trash spilling onto road.' },
      { title: 'Sweeper not cleaning Katra residential streets', desc: 'No street sweeping done in Block D for two weeks.' },
      { title: 'Plastic accumulation in Civil Lines storm drains', desc: 'Drains choked with plastic bags and bottles.' },
      { title: 'Illegal waste burning by clinic in Naini', desc: 'Medical waste set on fire behind public clinic.' },
      { title: 'Foul odor from sewage cleaning site in Georgetown', desc: 'Debris from drain cleaning left on street, smell is unbearable.' },
      { title: 'Silt accumulation after drain clean in Ashok Nagar', desc: 'Dried silt blocks half of the road lane.' },
      { title: 'Garbage truck spilling trash in Jhalwa', desc: 'Truck moves without net covering, dropping trash.' }
    ];

    // Issues list for Parks
    const parksIssues = [
      { title: 'Fallen tree blocking path in Alfred Park', desc: 'Large branch broke during storm, blocking park jogging track.' },
      { title: 'Broken swings in Georgetown children park', desc: 'Metal swings have rusted and broken, unsafe for kids.' },
      { title: 'Overgrown weeds in Ashok Nagar park', desc: 'Grass is 2 feet high, breeding ground for mosquitoes.' },
      { title: 'Broken benches in Naini community garden', desc: 'Three concrete benches are cracked and unusable.' },
      { title: 'Broken sprinkler wasting park water in Civil Lines', desc: 'Water spraying onto walkway and road from broken nozzle.' },
      { title: 'Stray cows inside Jhalwa community park', desc: 'Park gate is broken, cows destroying plants.' },
      { title: 'Illegal vendors occupying Katra park gate', desc: 'Food stalls blocking park main entrance.' },
      { title: 'Broken boundary wall of Georgetown central park', desc: 'Boundary wall brickwork collapsed, dogs entering.' },
      { title: 'Dry leaves pile set on fire in Alfred Park', desc: 'Gardener burning dry leaves inside park premises, smoke hazard.' },
      { title: 'Dried up lawn in Ashok Nagar garden', desc: 'Lawn turning yellow due to lack of watering by staff.' },
      { title: 'Broken security gate of Jhalwa ladies park', desc: 'Iron gate has come off its hinges, needs welding.' }
    ];

    const generateComplaintsForDept = async (issues, deptId, categoryName) => {
      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        const status = statuses[i % statuses.length];
        const priority = priorities[i % priorities.length];
        const ward = wards[i % wards.length];
        const area = areas[i % areas.length];
        
        // Find employee assigned to this ward and department
        const matchingEmployee = await User.findOne({
          role: 'employee',
          ward: ward,
          department: deptId
        });

        await Complaint.create({
          title: issue.title,
          description: issue.desc,
          category: categoryName,
          department: deptId,
          citizen: citizenUser._id,
          status: matchingEmployee ? 'Assigned' : 'Pending',
          assignedTo: matchingEmployee ? matchingEmployee._id : null,
          location: {
            address: `Plot No. ${100 + i * 7}, ${area}`,
            ward: ward,
            area: area,
            coordinates: {
              latitude: 25.4358 + (i * 0.002) - 0.01,
              longitude: 81.8463 + (i * 0.002) - 0.01
            }
          },
          priority: priority
        });
      }
    };

    // Seed for all 5 departments (11 complaints per department = 55 complaints total)
    await generateComplaintsForDept(roadIssues, deptMap['ROAD'], 'Road Damage');
    await generateComplaintsForDept(waterIssues, deptMap['WATER'], 'Water Leakage');
    await generateComplaintsForDept(electricityIssues, deptMap['ELECTRICITY'], 'Street Light');
    await generateComplaintsForDept(sanitationIssues, deptMap['SANITATION'], 'Garbage Collection');
    await generateComplaintsForDept(parksIssues, deptMap['PARKS'], 'Parks');

    console.log('Seeded 55 detailed municipal complaints with auto-assigned ward staff.');
  } catch (error) {
    console.error('Data seeding error:', error);
  }
};

module.exports = seedData;
