<div class="container-fluid">
    <nav class="navbar navbar-default navbar-fixed-top">
        <div class="navbar-header">
            <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".js-navbar-collapse">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>

            <a class="navbar-brand" href="../isreport"><b>ISReport BDG 7 | 2K Kuningan</b></a>
        </div>

        <style>
            .button {
                padding: 5px 5px;
                font-size: 20px;
                text-align: center;
                cursor: pointer;
                outline: none;
                color: #fff;
                background-color: #ff0e0e;
                border: none;
                border-radius: 15px;
                box-shadow: 0 4px 4px 2px #999;
            }

            /* .button:hover {
                background-color: #ff0e0e;
            } */

            .button:active {
                background-color: #ff3633;
                box-shadow: 0 5px #666;
                transform: translateY(4px);
            }

            /* Fix untuk dropdown hover */
            /* .dropdown:hover .dropdown-menu {
                display: block;
            } */

            .mega-dropdown-menu {
                padding: 20px;
                width: 100%;
            }

            .dropdown-header {
                font-weight: bold;
                padding: 5px 0;
            }

            .merah {
                color: red;
            }
        </style>

        <div class="collapse navbar-collapse js-navbar-collapse">
            <ul class="nav navbar-nav">
                <li class="dropdown mega-dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">STORE<span class="glyphicon glyphicon-chevron-down pull-right"></span></a>
                    <ul class="dropdown-menu mega-dropdown-menu row">
                        <li class="col-sm-3">
                            <ul>
                                <li>
                                    <a href="../my-inq">
                                        <button class="button">
                                            <b>Informasi Promosi</b>
                                        </button>
                                        <span class="badge" style="color: white;">&#10003;</span>
                                    </a>
                                </li>
                                <li class="dropdown-header">Sales</li>
                                <li><a href="../sales-today">
                                        <font color=>Sales Today <span class="badge" style="color: white;">&#10003;</span></font>
                                    </a></li>
                                <li><a href="../Sales-today-new">
                                        <font color=>Sales Today New <span class="badge" style="color: white;">&#10003;</span></font>
                                    </a></li>
                                <li><a href="../sales-yesterday">Sales Yesterday <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Sales-Perjam-Perbulan">Sales Per Jam Per Bulan<span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li class="divider"></li>

                                <!-- <li class="dropdown-header">Evaluasi Kunjungan</li>
                                <li><a href="../member-kunjungan">Kunjungan Member Merah</a></li>
                                <li><a href="../ikiosk">Kunjungan iKiosk</a></li>
                                <li><a href="../aktifasi-kartu">Member Aktivasi Kartu</a></li>
                                <li class="divider"></li> -->

                                <li class="dropdown-header">Kartu Member</li>
                                <div id="womenCollection" class="carousel slide" data-ride="carousel">
                                    <div class="carousel-inner">
                                        <div class="item active">
                                            <a href="#"><img src="../image/logoplt.jpg" class="img-responsive" alt="product 1"></a>
                                            <h4><small>Member Platinum</small></h4>
                                            <button class="btn btn-danger" type="button"></button>
                                        </div>
                                        <div class="item">
                                            <a href="#"><img src="../image/logomm.jpg" class="img-responsive" alt="product 2"></a>
                                            <h4><small>Member Merah</small></h4>
                                            <button class="btn btn-danger" type="button"></button>
                                        </div>
                                        <div class="item">
                                            <a href="#"><img src="../image/logomb.jpg" class="img-responsive" alt="product 3"></a>
                                            <h4><small>Member Biru</small></h4>
                                            <button class="btn btn-primary" type="button"></button>
                                        </div>
                                        <div class="item">
                                            <a href="#"><img src="../image/logoom.jpg" class="img-responsive" alt="product 3"></a>
                                            <h4><small>Member Omi</small></h4>
                                            <button class="btn btn-primary" type="button"></button>
                                        </div>
                                    </div>
                                    <a class="left carousel-control" href="#womenCollection" role="button" data-slide="prev">
                                        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                                        <span class="sr-only">Previous</span>
                                    </a>
                                    <a class="right carousel-control" href="#womenCollection" role="button" data-slide="next">
                                        <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                                        <span class="sr-only">Next</span>
                                    </a>
                                </div>
                            </ul>
                        </li>

                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header"> Evaluasi Sales</li>
                                <li><a href="../evaluasi-sales">Evaluasi Sales <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../evaluasi-sales-promo">Evaluasi Sales Promo <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../evaluasi-sales-nonpromo">Evaluasi Sales <span class="badge">Diluar Item Larangan</span> <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../evaluasi-sales-igr-ke-omi">Evaluasi IGR ke OMI > <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../evaluasi-sales-per-bulan">Evaluasi Sales Per Bulan <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../mr">Evaluasi Sales by MR <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li class="divider"></li>

                                <li class="dropdown-header">Kasir</li>
                                <li><a href="../item-distribusi">Item Distribusi <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../prime-bread">PRIME BREAD TODAY<span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../monit-checker">Monitoring Checker<span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../item-fokus">Struk Item Fokus<span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../actual-lap310">Actual Lap310<span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../pembatasan">Pembatasan Promo <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li class="divider"></li>

                                <li class="dropdown-header">Mitra & I-Saku</li>
                                <li><a href="../mitra-topup">Monitoring Top Up Mitra IGR <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../mitra-topup-MB">Monitoring Top Up Mitra IGR MB <span class="badge" style="color: white;">&#10003;</span><span class="badge"></a></li>
                            </ul>
                        </li>

                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header">Member</li>
                                <li><a href="../Master-Member">Master Member <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../cek_data_member">Cek Data Member <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../belum-aktivasi-kartu">Belum Aktivasi Kartu <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../transaksimember/menu.php">History Transaksi Member <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../mm-koordinat">MM Koordinat <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../poin">Poin Member</a></li>
                                <li class="divider"></li>

                                <li class="dropdown-header">Produk</li>
                                <li><a href="../trans-kasir">History Transaksi Produk <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li class="divider"></li>

                                <li class="dropdown-header">Hadiah</li>
                                <li><a href="../history-gift-ms">History Gift <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../monitoring_gift">Monitoring Gift <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../hdh">Monitoring Hadiah <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li class="divider"></li>
                                <li class="dropdown-header">Casback</li>
                                <li><a href="../CB">Monitoring Cashback <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li class="dropdown-header">Barkos</li>
                                <li class="divider"></li>
                                <li><a href="../Barkos">Barang Kosong <span class="badge" style="color: white;">&#10003;</span> </a> </li>
                            </ul>
                        </li>

                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header">Problem <span class="glyphicon glyphicon-exclamation-sign merah"></span></li>
                                <li><a href="../barcode-double">Barcode Double <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../informasi-produk/report.php?satuanJual=0&statusTag=All&tanggalPromosi=All&namaBarang=&kodePLU=&kodeBarcode=&kodeMonitoringPLU=&kodeDivisi=All&kodeDepartemen=All&kodeKategoriBarang=All&kodeTag=All&kodeSupplier=&namaSupplier=&kodeMonitoringSupplier=&lokasiTidakAda=on&jenisMarginNegatif=All&jenisLaporan=1">Master Lokasi Belum Ada <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../master-lokasi-double">Master Lokasi Double <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../lokasi-qty-minus">Lokasi Rak Qty Minus <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li class="divider"></li>

                                <li class="dropdown-header">Harga</li>
                                <li><a href="../Perubahan-Harga">Perubahan Harga Pagi Hari <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../informasi-produk/report.php?satuanJual=0&statusTag=All&tanggalPromosi=All&namaBarang=&kodePLU=&kodeBarcode=&kodeMonitoringPLU=&kodeDivisi=All&kodeDepartemen=All&kodeKategoriBarang=All&kodeTag=All&kodeSupplier=&namaSupplier=&kodeMonitoringSupplier=&hargaJualNol=on&jenisMarginNegatif=All&jenisLaporan=1">Harga Jual Belum Ada <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../informasi-produk/report.php?satuanJual=0&statusTag=All&tanggalPromosi=All&namaBarang=&kodePLU=&kodeBarcode=&kodeMonitoringPLU=&kodeDivisi=All&kodeDepartemen=All&kodeKategoriBarang=All&kodeTag=All&kodeSupplier=&namaSupplier=&kodeMonitoringSupplier=&promoMahal=on&jenisMarginNegatif=All&jenisLaporan=1">Harga Promo Lebih Mahal <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Margin-Minus">Harga Margin Negatif <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Harga-nett-All-Satuan">Harga Nett All Satuan Jual <span class="badge"></span></a></li>
                                <li><a href="../Harga-nett-Satuan-Nol">Harga Nett Satuan Jual Nol <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li class="divider"></li>

                                <li class="dropdown-header">Information</li>
                                <li><a href="../Plu-timbangan">Kode Plu Timbangan <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../Master-Lokasi">Master Lokasi <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../plu-non-promo">Item Non Promo <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>

            <ul class="nav navbar-nav">
                <li class="dropdown mega-dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">INVENTORY<span class="glyphicon glyphicon-chevron-down pull-right"></span></a>
                    <ul class="dropdown-menu mega-dropdown-menu row">
                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header">LPP</li>
                                <li><a href="../informasi-produk">Informasi Produk <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Informas-produk-all">Informasi Produk All <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../stock-all-v2">Stock All <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../lpp vs plano2">Lpp vs Plano <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../lpp-saat-ini">LPP Saat Ini <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Ljm-Plano-besar">Plano > Lpp <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../lpp-bulan-lalu">LPP Bulan Lalu <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li class="divider"></li>
                                <li class="dropdown-header">Stock</li>
                                <li><a href="../stock-harian">Stock Harian <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../stock-tag-nx">Stock Item Tag N,X Masih Ada <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../soic">SO IC <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../ic">Monitoring SO IC <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../Log-so-harian">So Harian <span class="badge" style="color: white;">&#10003;</span> </a></li>
                                <li><a href="../Soharian">SO Per Produk <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../cek-ffo">Intransit, dsp dan bpb <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li class="divider"></li>
                                <li class="dropdown-header">Transaksi</li>
                                <li><a href="../transaksi-bo">History Back Office <span class="badge" style="color: white;">&#10003;</span></a> </li>
                                <li><a href="../Pb_out">PB Out Vs Btb <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span><span class="badge"></span></a></li>
                                <li><a href="../sortir-vs-perubahan-status">Sortir vs Perubahan Status<span class="badge">Detail</span> <span class="badge" style="color: white;">&#10003;</span></a></li>
                            </ul>
                        </li>

                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header">Monitoring</li>
                                <li><a href="../service-level">Service Level <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../adams/sl bpb po.php">Service Level V2<span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../kinerja3">Kinerja Picker<span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li class="divider"></li>
                                <li><a href="../cek-pb">Monitoring PB <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li class="divider"></li>
                                <li><a href="../sonas-baso">Berita Acara Stock Opname <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../monitoring-sosis">Monitoring Sosis</a></li>
                                <li class="divider"></li>
                                <li class="dropdown-header"> Monitoring Po Or Bpb</li>
                                <li><a href="../evaluasi-barang-baru">BPB Barang Baru <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Ljm-PO">Po Dari BPB Terakhir <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../po">Informasi PO <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Ljm-PO2">Cek Pb Vs Po <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../antrian_penerimaan_barang">Antrian BPB <span class="badge" style="color: white;">&#10003;</span><span class="badge"></span></a></li>
                                <li><a href="../Ljm-Slp-H1">Slp H-1 <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Ljm-Slp-btb">Slp Vs Btb H-1 <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Ljm-po-bpb">PO VS BPB <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Ljm-po-bpb(0)">PO VS BPB (BPB 0) <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li class="divider"></li>
                                <li class="dropdown-header">Admin</li>
                                <li><a href="../dsiallproduk">DSI All Product <span class="badge" style="color: white;">&#10003;</span></a></li>
                                <li><a href="../Historybkl">History BKL <span class="badge" style="color: white;">&#10003;</span></a></li>
                            </ul>
                        </li>

                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header"> Problem</li>
                                <li><a href="../tag_hanox">TAG HANOX <span class="badge" style="color: white;">&#10003;</span> </a></li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>

            <ul class="nav navbar-nav">
                <li class="dropdown mega-dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">PROGRAM HO<span class="glyphicon glyphicon-chevron-down pull-right"></span></a>
                    <ul class="dropdown-menu mega-dropdown-menu row">
                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header">IAS BACKOFFICE</li>
                                <li><a href="http://192.168.222.190:81/login" target="_blank">IAS IGR BDG</a></li>
                                <li><a href="http://172.31.147.158:80/login" target="_blank">IAS SPI 2K</a></li>
                            </ul>
                        </li>
                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header">TSM DAN ESS</li>
                                <li><a href="http://ess1.indomaret.lan/ess/homeportal" target="_blank">ESS 1</a></li>
                                <li><a href="http://ess2.indomaret.lan/ess/homeportal" target="_blank">ESS 2</a></li>
                                <li><a href="http://172.20.30.6/tsm/Login.aspx" target="_blank">TSM</a></li>
                            </ul>

                            <ul>
                                <li class="dropdown-header">MITRA</li>
                                <li><a href="https://mitraindogrosir.co.id/cms/login" target="_blank">VARIF MITRA</a></li>
                            </ul>
                        </li>
                        <li class="col-sm-3">
                            <ul>
                                <li class="dropdown-header">EDP / IT</li>
                                <li><a href="https://www.instagram.com/albrgalh_" target="_blank">ALBER</a></li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>

            <ul class="nav navbar-nav">
                <li class="dropdown mega-dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">EDP<span class="glyphicon glyphicon-chevron-down pull-right"></span></a>
                    <ul class="dropdown-menu mega-dropdown-menu row">
                        <ul>
                            <li class="dropdown-header">Cek</li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/cek_harian" target="_blank">CEK PAGI</a></li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/adams/monitor.php" target="_blank">CEK IP</a></li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/adams/monitoring ipp.php" target="_blank">CEK SERTIM IPP</a></li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/adams/monitoring ME.php" target="_blank">CEK MONTHEND</a></li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/adams/tes_ping.php" target="_blank">CEK PING</a></li>
                        </ul>
                    </ul>
                </li>
            </ul>

            <ul class="nav navbar-nav">
                <li class="dropdown mega-dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">WEB REPORT<span class="glyphicon glyphicon-chevron-down pull-right"></span></a>
                    <ul class="dropdown-menu mega-dropdown-menu row">
                        <ul>
                            <li class="dropdown-header">REPORT</li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/" target="_blank">HOME</a></li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/adams/monitoring%20MR.php" target="_blank">MEMBER RELATION</a></li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/adams/monitoring%20pb%20today.php" target="_blank">TODAYS PB</a></li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/report/adams/monitoringitem.php" target="_blank">MONITORING ITEM ORDERS</a></li>
                            <li><a target="_blank" href="http://172.26.11.12:8080/spi2k/spikng2k" target="_blank">MONITORING SPI 2K</a></li>
                        </ul>
                </li>
            </ul>


            </li>
            </ul>

            <a href="../sonas-cek" class="btn btn-round btn-default navbar-btn">Cek Sonas</a>

            <script type="text/javascript">
                function showTime() {
                    var a_p = "";
                    var today = new Date();
                    var curr_hour = today.getHours();
                    var curr_minute = today.getMinutes();
                    var curr_second = today.getSeconds();
                    if (curr_hour < 12) {
                        a_p = "AM";
                    } else {
                        a_p = "PM";
                    }
                    if (curr_hour == 0) {
                        curr_hour = 12;
                    }
                    if (curr_hour > 12) {
                        curr_hour = curr_hour - 12;
                    }
                    curr_hour = checkTime(curr_hour);
                    curr_minute = checkTime(curr_minute);
                    curr_second = checkTime(curr_second);
                    document.getElementById('clock').innerHTML = curr_hour + ":" + curr_minute + ":" + curr_second + " " + a_p;
                }

                function checkTime(i) {
                    if (i < 10) {
                        i = "0" + i;
                    }
                    return i;
                }
                setInterval(showTime, 500);
            </script>
        </div>
    </nav>
</div>